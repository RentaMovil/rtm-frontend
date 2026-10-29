import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "./AuthContext";
import { authService } from "../features/auth/services/authService";
import { tokenStore } from "../shared/api/tokenStore";

vi.mock("../features/auth/services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changeEmail: vi.fn(),
  },
}));

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

const SESSION = {
  user: { id: 1, role: "CLIENT", permissions: ["reservations:create"] },
};
const PROFILE = { id: 1, role: "CLIENT", email: "cliente@mail.com" };

afterEach(() => {
  localStorage.clear();
  tokenStore.clear();
  vi.clearAllMocks();
});

describe("AuthContext > restoreSession (al montar)", () => {
  it("si el refresh de la cookie funciona, deja al usuario autenticado con los permisos del refresh", async () => {
    authService.refreshSession.mockResolvedValue(SESSION);
    authService.getProfile.mockResolvedValue(PROFILE);

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.permissions).toEqual(["reservations:create"]);
    expect(result.current.error).toBeNull();
  });

  it("si no hay sesión (401 de un visitante nuevo), no queda autenticado y NO muestra error", async () => {
    authService.refreshSession.mockRejectedValue(new Error("401"));

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    // ADR-005: un visitante que nunca inició sesión no es un error, es el caso normal.
    expect(result.current.error).toBeNull();
  });
});

describe("AuthContext > login", () => {
  it("autentica al usuario y limpia cualquier error previo", async () => {
    authService.refreshSession.mockRejectedValue(new Error("401"));
    authService.login.mockResolvedValue(SESSION);

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: "a@a.com", password: "x" });
    });

    expect(authService.login).toHaveBeenCalledWith({ email: "a@a.com", password: "x" });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.id).toBe(1);
  });
});

describe("AuthContext > logout", () => {
  it("deja al usuario sin sesión cuando el servidor responde bien", async () => {
    authService.refreshSession.mockResolvedValue(SESSION);
    authService.getProfile.mockResolvedValue(PROFILE);
    authService.logout.mockResolvedValue(undefined);

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

describe("AuthContext > updateProfile", () => {
  it("si el backend rechaza el cambio, expone el mensaje en error y no toca al usuario", async () => {
    authService.refreshSession.mockResolvedValue(SESSION);
    authService.getProfile.mockResolvedValue(PROFILE);

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    authService.updateProfile.mockRejectedValue(new Error("El teléfono no es válido"));

    let thrown = null;
    await act(async () => {
      try {
        await result.current.updateProfile({ phone: "abc" });
      } catch (caught) {
        thrown = caught;
      }
    });

    expect(thrown).toMatchObject({ message: "El teléfono no es válido" });
    expect(result.current.error).toBe("El teléfono no es válido");
  });
});

describe("AuthContext > hasRole", () => {
  it("compara contra el rol real del usuario autenticado", async () => {
    authService.refreshSession.mockResolvedValue(SESSION);
    authService.getProfile.mockResolvedValue(PROFILE);

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    expect(result.current.hasRole("CLIENT")).toBe(true);
    expect(result.current.hasRole("ADMIN", "SUPER_ADMIN")).toBe(false);
  });

  it("sin sesión, ningún rol hace match", async () => {
    authService.refreshSession.mockRejectedValue(new Error("401"));

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasRole("CLIENT")).toBe(false);
  });
});
