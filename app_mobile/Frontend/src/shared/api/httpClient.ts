import { API_URL } from "../../config/env";
import { tokenStore } from "./tokenStore";

/**
 * Cliente HTTP de la app.
 *
 * Espejo de `web/Front-end/src/shared/api/httpClient.js`:
 *  - Authorization: Bearer cuando hay access token
 *  - 401 -> refresh UNA vez y reintenta la peticion original
 *  - 204 -> null
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
  const refreshToken = await tokenStore.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No hay refresh token");
  }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
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
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  let res = await rawRequest(endpoint, options);

  const isAuthRoute =
    endpoint === "/auth/login" ||
    endpoint === "/auth/register" ||
    endpoint === "/auth/refresh" ||
    endpoint === "/auth/forgot-password" ||
    endpoint === "/auth/verify-code" ||
    endpoint === "/auth/reset-password";

  if (res.status === 401 && !isAuthRoute) {
    try {
      // Un solo refresh concurrente: varias pantallas pueden pedir datos a la vez.
      refreshPromise = refreshPromise ?? refreshAccessToken();
      await refreshPromise;
      refreshPromise = null;

      res = await rawRequest(endpoint, options);
    } catch {
      refreshPromise = null;
      await tokenStore.clearAll();
      tokenStore.triggerRefreshFail();
      throw new Error("Sesion expirada");
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      (errorBody as { message?: string } | null)?.message ??
      `Error ${res.status} en ${endpoint}`;

    throw new ApiError(message, res.status, errorBody);
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
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
