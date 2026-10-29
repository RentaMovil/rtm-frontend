/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authService } from "../features/auth/services/authService";
import {
  clearSession,
  saveSession,
} from "../features/auth/services/sessionStorage";
import { tokenStore } from "../shared/api/tokenStore";

const AuthContext = createContext(null);

// /users/me no trae permisos (solo el login y el refresh): al actualizar el perfil
// se conservan los que ya tenía la sesión, si no se esconde el menú de super admin
const keepPermissions = (profile) => (prev) => ({
  ...profile,
  permissions: prev?.permissions ?? [],
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const restoreStarted = useRef(false);

  const clearLocalAuth = useCallback(() => {
    tokenStore.clear();
    clearSession();
    setUser(null);
  }, []);

  // ADR-005: ya no hay un refresh token en localStorage para mirar antes de decidir si hay
  // sesión -- vive en una cookie httpOnly que JS no puede leer. Así que esto ya no pregunta
  // "¿hay token guardado?", sino que intenta el refresh y deja que iam responda. Un 401 aquí
  // es el caso normal de un visitante que nunca inició sesión, no un error real: se limpia en
  // silencio, sin mostrar mensaje.
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await authService.refreshSession();
      const profile = await authService.getProfile();

      // /users/me no trae permisos, se toman de la respuesta del refresh
      setUser({ ...profile, permissions: session.user?.permissions ?? [] });

    } catch {
      clearLocalAuth();
    } finally {
      setIsLoading(false);
    }
  }, [clearLocalAuth]);

  useEffect(() => {
    if (restoreStarted.current) {
      return;
    }

    restoreStarted.current = true;

    // La restauración sincroniza el estado inicial con la sesión remota.
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    tokenStore.setOnRefreshFail(() => {
      clearLocalAuth();
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
    });

    return () => {
      tokenStore.setOnRefreshFail(() => {});
    };
  }, [clearLocalAuth]);

  const login = useCallback(async (credentials) => {
    setError(null);
    const session = await authService.login(credentials);
    setUser(session.user);
    return session;
  }, []);

  // La cuenta queda PENDING_VERIFICATION: todavía no hay sesión (ver verifyEmail), así que acá
  // no se toca `user`.
  const register = useCallback(async (formData) => {
    setError(null);
    return authService.register(formData);
  }, []);

  // Confirma el código que llega al registrarse. Si es válido, activa la cuenta y ya deja la
  // sesión iniciada -- mismo patrón que login.
  const verifyEmail = useCallback(async (email, code) => {
    setError(null);
    const session = await authService.verifyEmail(email, code);
    setUser(session.user);
    return session;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearLocalAuth();
  }, [clearLocalAuth]);

  const refreshProfile = useCallback(async () => {
    setError(null);

    try {
      const profile = await authService.getProfile();
      setUser(keepPermissions(profile));
      return profile;
    } catch (profileError) {
      setError(profileError?.message ?? "No fue posible cargar el perfil.");
      throw profileError;
    }
  }, []);

  /**
   * Guarda los cambios del perfil y sincroniza el estado global con lo que
   * devolvio el servidor, para que el resto de la app vea el nombre nuevo
   * sin tener que recargar.
   */
  const updateProfile = useCallback(async (changes) => {
    setError(null);

    try {
      const updated = await authService.updateProfile(changes);
      setUser(keepPermissions(updated));
      saveSession({ user: updated });
      return updated;
    } catch (profileError) {
      setError(profileError?.message ?? "No fue posible guardar el perfil.");
      throw profileError;
    }
  }, []);

  /**
   * Cambia el correo del usuario autenticado y sincroniza el estado global
   * con lo que devolvio el servidor.
   *
   * A diferencia de `updateProfile`, no escribe en el error global: el
   * formulario pide un unico mensaje generico para cualquier fallo, y el
   * texto concreto del backend no debe aparecer en otra parte de la
   * pantalla. Quien llama decide que mostrar.
   */
  const changeEmail = useCallback(async (newEmail, currentPassword) => {
    const updated = await authService.changeEmail(newEmail, currentPassword);
    setUser(keepPermissions(updated));
    saveSession({ user: updated });
    return updated;
  }, []);

  const hasRole = useCallback(
    (...roles) => roles.includes(user?.role),
    [user?.role],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      login,
      register,
      verifyEmail,
      logout,
      restoreSession,
      refreshProfile,
      updateProfile,
      changeEmail,
      hasRole,
      clearError: () => setError(null),
    }),
    [
      user,
      isLoading,
      error,
      login,
      register,
      verifyEmail,
      logout,
      restoreSession,
      refreshProfile,
      updateProfile,
      changeEmail,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
