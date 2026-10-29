import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient, refreshSession } from "./httpClient";
import { tokenStore } from "./tokenStore";

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => body,
    clone() {
      return jsonResponse(status, body);
    },
    text: async () => JSON.stringify(body),
  };
}

beforeEach(() => {
  globalThis.fetch = vi.fn();
  tokenStore.clear();
  tokenStore.setAccessToken("expired-access-token");
  tokenStore.setOnRefreshFail(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("httpClient > reintento automático tras un 401", () => {
  it("si expiró el access token, refresca UNA vez (vía cookie) y reintenta la petición original", async () => {
    globalThis.fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: "TOKEN_EXPIRED" })) // 1ª: /vehicles
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: "new-token" })) // 2ª: /auth/refresh
      .mockResolvedValueOnce(jsonResponse(200, [{ id: 1 }])); // 3ª: reintento de /vehicles

    const result = await httpClient.get("/vehicles");

    expect(result).toEqual([{ id: 1 }]);
    expect(tokenStore.getAccessToken()).toBe("new-token");

    // La llamada de refresh no debe llevar body ni header manual del refresh token: viaja
    // solo por la cookie httpOnly (ADR-005) + el header que identifica al cliente como web.
    const refreshCall = globalThis.fetch.mock.calls[1];
    expect(refreshCall[0]).toContain("/auth/refresh");
    expect(refreshCall[1].credentials).toBe("include");
    expect(refreshCall[1].headers["X-Client-Platform"]).toBe("web");
    expect(refreshCall[1].body).toBeUndefined();
  });

  it("no intenta refrescar si el 401 viene de /auth/login (contraseña incorrecta, no token vencido)", async () => {
    globalThis.fetch.mockResolvedValueOnce(
      jsonResponse(401, { error: "INVALID_CREDENTIALS", message: "Credenciales inválidas" }),
    );

    await expect(httpClient.post("/auth/login", { identifier: "a", password: "x" })).rejects.toThrow(
      "Credenciales inválidas",
    );

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("no intenta refrescar si el 401 es por contraseña actual incorrecta (cambiar contraseña/correo)", async () => {
    globalThis.fetch.mockResolvedValueOnce(jsonResponse(401, { error: "INCORRECT_PASSWORD" }));

    await expect(httpClient.patch("/users/me/password", { currentPassword: "mal" })).rejects.toThrow();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("si el refresh también falla, limpia el token local y dispara triggerRefreshFail", async () => {
    const onRefreshFail = vi.fn();
    tokenStore.setOnRefreshFail(onRefreshFail);

    globalThis.fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: "TOKEN_EXPIRED" })) // /vehicles
      .mockResolvedValueOnce(jsonResponse(401, { error: "INVALID_TOKEN" })); // /auth/refresh

    await expect(httpClient.get("/vehicles")).rejects.toThrow();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(onRefreshFail).toHaveBeenCalledTimes(1);
  });

  it("dos 401 simultáneos comparten UN solo refresh, no uno cada uno (si no, iam los trata como robo)", async () => {
    let refreshCalls = 0;
    globalThis.fetch.mockImplementation((url) => {
      if (String(url).includes("/auth/refresh")) {
        refreshCalls += 1;
        return Promise.resolve(jsonResponse(200, { accessToken: "new-token" }));
      }
      return Promise.resolve(jsonResponse(200, { ok: true }));
    });

    // Simula lo que hace httpClient.request(): si ya hay un refresh en curso, lo espera
    // en vez de lanzar otro.
    const [a, b] = await Promise.all([refreshSession(), refreshSession()]);

    expect(refreshCalls).toBe(1);
    expect(a).toBe(b);
  });
});
