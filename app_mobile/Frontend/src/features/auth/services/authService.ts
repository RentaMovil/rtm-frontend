import { API_ROUTES } from "../../../config/env";
import { httpClient } from "../../../shared/api/httpClient";

import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshResponse,
  RegisterRequest,
  ResetPasswordRequest,
  User,
  VerifyCodeRequest,
} from "../../../types";

/**
 * Servicio de autenticacion contra rtm-iam (a traves del gateway).
 *
 * login/register/profile usan camelCase (firstName, lastName...), no el
 * snake_case del mock. `login` ademas espera `identifier` (email o
 * username), no `email`.
 *
 * forgotPassword/verifyCode/resetPassword quedan sin tocar: ninguna
 * pantalla los llama todavia (no hay flujo de "olvide mi contrasena" en el
 * movil) y el real no separa verificar-codigo de cambiar-contrasena en dos
 * pasos como estas funciones asumen.
 */

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(API_ROUTES.auth.login, {
    identifier: data.email.trim().toLowerCase(),
    password: data.password,
  });
}

export async function register(
  data: RegisterRequest,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(API_ROUTES.auth.register, {
    firstName: data.first_name.trim(),
    lastName: data.last_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    username: data.username.trim(),
    password: data.password,
  });
}

export async function refresh(
  refreshToken: string,
): Promise<RefreshResponse> {
  return httpClient.post<RefreshResponse>(API_ROUTES.auth.refresh, {
    refreshToken,
  });
}

export async function logout(refreshToken: string): Promise<void> {
  // Responde 204. Un 404/401 aqui no debe impedir el logout local.
  await httpClient
    .post<void>(API_ROUTES.auth.logout, { refreshToken })
    .catch(() => undefined);
}

/** GET /users/me (ProfileResponse): trae el perfil completo, incluido el telefono. */
export async function getCurrentUser(): Promise<User> {
  return httpClient.get<User>(API_ROUTES.auth.me);
}

export async function forgotPassword(email: string): Promise<void> {
  await httpClient.post<void>(API_ROUTES.auth.forgotPassword, {
    email: email.trim().toLowerCase(),
  });
}

export async function verifyCode(data: VerifyCodeRequest): Promise<boolean> {
  const res = await httpClient.post<{ verified: boolean }>(
    API_ROUTES.auth.verifyCode,
    { email: data.email.trim().toLowerCase(), code: data.code.trim() },
  );

  return res.verified;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<void> {
  await httpClient.post<void>(API_ROUTES.auth.resetPassword, {
    email: data.email.trim().toLowerCase(),
    newPassword: data.newPassword,
  });
}

/** PATCH /users/me/password (ChangePasswordRequest): currentPassword/newPassword, ya coincide. */
export async function changePassword(
  data: ChangePasswordRequest,
): Promise<void> {
  await httpClient.patch<void>(API_ROUTES.auth.changePassword, data);
}

/**
 * Actualiza el perfil del usuario autenticado.
 *
 * `PATCH /users/me` (UpdateProfileRequest): firstName/lastName/phone/imageUrl,
 * todos opcionales. El server resuelve el usuario por el access token.
 */
export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  phone: string;
  imageUrl?: string | null;
}): Promise<User> {
  return httpClient.patch<User>(API_ROUTES.auth.me, data);
}
