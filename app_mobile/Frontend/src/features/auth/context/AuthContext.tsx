import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { tokenStore } from "../../../shared/api/tokenStore";

import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  refresh as refreshService,
  register as registerService,
  resetPassword,
  verifyCode,
  updateProfile as updateProfileService,
} from "../services/authService";

import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "../../../types";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { firstName: string; lastName: string; phone: string; imageUrl?: string | null }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restaura la sesion al arrancar.
   *
   * El access token NO se persiste (vive en memoria), asi que la unica forma
   * de recuperar sesion es canjear el refresh token por uno nuevo y despues
   * pedir `/auth/me`. Si el refresh falla, la sesion simplemente no existe.
   */
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const refreshToken = await tokenStore.getRefreshToken();

        if (!refreshToken) {
          return;
        }

        const response = await refreshService(refreshToken);

        tokenStore.setAccessToken(response.accessToken);
        // rtm-iam rota el refresh token: hay que guardar el nuevo o la
        // siguiente renovacion reenvia uno ya invalido (ver httpClient.ts).
        await tokenStore.setRefreshToken(response.refreshToken);

        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        // Refresh invalido o expirado: limpiar y arrancar como invitado.
        await tokenStore.clearAll();

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Cuando el refresh automatico del httpClient falla, la sesion se murio:
   * hay que vaciar el estado para que el layout redirija a /auth/login.
   */
  useEffect(() => {
    tokenStore.setOnRefreshFail(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await loginService(data);

    tokenStore.setAccessToken(response.accessToken);
    await tokenStore.setRefreshToken(response.refreshToken);

    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await registerService(data);

    tokenStore.setAccessToken(response.accessToken);
    await tokenStore.setRefreshToken(response.refreshToken);

    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await tokenStore.getRefreshToken();

    await logoutService(refreshToken ?? "");

    await tokenStore.clearAll();

    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();

    setUser(currentUser);
  }, []);

  // El context expone argumentos posicionales; los servicios reciben objetos.
  // Se envuelven para que las pantallas no dependan de la forma del payload.
  const handleForgotPassword = useCallback((email: string) => {
    return forgotPassword(email);
  }, []);

  const handleVerifyCode = useCallback((email: string, code: string) => {
    return verifyCode({ email, code });
  }, []);

  const handleResetPassword = useCallback(
    (email: string, newPassword: string) => {
      return resetPassword({ email, newPassword });
    },
    [],
  );

  const handleChangePassword = useCallback(
    (currentPassword: string, newPassword: string) => {
      return changePassword({ currentPassword, newPassword });
    },
    [],
  );
const updateProfile = useCallback(
    async (data: { firstName: string; lastName: string; phone: string; imageUrl?: string | null }) => {
        const updatedUser = await updateProfileService(data);
        setUser(updatedUser);
    },
    [],
);
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      forgotPassword: handleForgotPassword,
      verifyCode: handleVerifyCode,
      resetPassword: handleResetPassword,
      changePassword: handleChangePassword,
      refreshUser,
      updateProfile,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      handleForgotPassword,
      handleVerifyCode,
      handleResetPassword,
      handleChangePassword,
      updateProfile
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}

