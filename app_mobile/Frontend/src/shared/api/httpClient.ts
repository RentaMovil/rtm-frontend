import { API_ROUTES, API_URL } from "../../config/env";
import { tokenStore } from "./tokenStore";

/**
 * Cliente HTTP de la app.
 *
 * Espejo de `web/Front-end/src/shared/api/httpClient.js`:
 *  - Authorization: Bearer cuando hay access token
 *  - 401 -> refresh UNA vez y reintenta la peticion original
 *  - 204 -> null
 *  - timeouts de 15 segundos y cancelacion por AbortSignal
 *  - error: propaga `errorBody.message` del server
 *
 * Unico mobile: usa `AbortSignal` de `fetch` nativo (React Native ya lo
 * soporta) para poder cancelar peticiones al desmontar pantallas.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type HttpRequestOptions = Pick<RequestOptions, "signal">;

const REQUEST_TIMEOUT_MS = 15_000;

export class HttpRequestTimeoutError extends Error {
  constructor(endpoint: string) {
    super(`La solicitud a ${endpoint} excedió el tiempo de espera.`);
    this.name = "HttpRequestTimeoutError";
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function createAbortError(): Error {
  const error = new Error("La solicitud fue cancelada.");
  error.name = "AbortError";
  return error;
}

function waitForPromiseOrAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    function cleanup() {
      signal.removeEventListener("abort", onAbort);
    }

    function onAbort() {
      cleanup();
      reject(createAbortError());
    }

    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error: unknown) => {
        cleanup();
        reject(error);
      },
    );
  });
}

async function rawRequest(
  endpoint: string,
  { method = "GET", body, headers = {}, signal }: RequestOptions = {},
): Promise<Response> {
  const token = tokenStore.getAccessToken();

  return fetch(`${API_URL}${endpoint}`, {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let refreshPromise: Promise<string> | null = null;

// These endpoints are public authentication flows. A 401 here is the endpoint's
// own response and must not trigger a refresh using a possibly stale session.
// Keep this set derived from API_ROUTES so route changes cannot silently drift.
const AUTH_ROUTES_WITHOUT_REFRESH = new Set<string>([
  API_ROUTES.auth.login,
  API_ROUTES.auth.register,
  API_ROUTES.auth.refresh,
  API_ROUTES.auth.forgotPassword,
  API_ROUTES.auth.verifyCode,
  API_ROUTES.auth.resetPassword,
  API_ROUTES.auth.verifyEmail,
  API_ROUTES.auth.resendEmailVerification,
]);

/**
 * Renueva el access token.
 *
 * rtm-iam ROTA el refresh token (de un solo uso): el que se manda aqui queda
 * invalido en el servidor y la respuesta trae uno nuevo. Si no se persiste,
 * la proxima renovacion reenvia el viejo, el servidor lo detecta como
 * reutilizado y cierra TODAS las sesiones (bucle de "vuelve a iniciar
 * sesion" en cuanto algo dispara un segundo refresh).
 */
async function refreshAccessToken(): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const refreshToken = await tokenStore.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No hay refresh token");
    }

    const res = await fetch(`${API_URL}${API_ROUTES.auth.refresh}`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error("No se pudo refrescar la sesion");
    }

    const data = (await res.json()) as { accessToken: string; refreshToken: string };

    tokenStore.setAccessToken(data.accessToken);
    await tokenStore.setRefreshToken(data.refreshToken);

    return data.accessToken;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new HttpRequestTimeoutError(API_ROUTES.auth.refresh);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getOrStartRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refresh = refreshAccessToken();
  const sharedRefresh = refresh.finally(() => {
    if (refreshPromise === sharedRefresh) refreshPromise = null;
  });
  refreshPromise = sharedRefresh;
  return sharedRefresh;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const callerSignal = options.signal;
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();

  if (callerSignal?.aborted) {
    controller.abort();
  } else {
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  const requestOptions = { ...options, signal: controller.signal };

  try {
    let res = await rawRequest(endpoint, requestOptions);

    const isAuthRoute = AUTH_ROUTES_WITHOUT_REFRESH.has(endpoint);

    if (res.status === 401 && !isAuthRoute) {
      try {
        // Un solo refresh concurrente: varias pantallas pueden pedir datos a la vez.
        const activeRefresh = getOrStartRefresh();
        await waitForPromiseOrAbort(activeRefresh, controller.signal);

        res = await rawRequest(endpoint, requestOptions);
      } catch (error) {
        if (controller.signal.aborted) throw error;

        await tokenStore.clearAll();
        tokenStore.triggerRefreshFail();
        throw new Error("Sesion expirada");
      }
    }

    if (!res.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await res.json();
      } catch (error) {
        if (controller.signal.aborted) throw error;
      }

      const message =
        (errorBody as { message?: string } | null)?.message ??
        `Error ${res.status} en ${endpoint}`;

      throw new ApiError(message, res.status, errorBody);
    }

    // 204, o 202 sin cuerpo (ej. /auth/password/forgot): no hay JSON que leer
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  } catch (error) {
    if (timedOut) throw new HttpRequestTimeoutError(endpoint);
    if (callerSignal?.aborted) throw createAbortError();
    throw error;
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}

export const httpClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
