import { API_ROUTES } from "../../../config/env";
import { httpClient } from "../../../shared/api/httpClient";

import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
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
 * forgotPassword/verifyCode/resetPassword siguen el flujo de recuperar
 * contrasena de iam: enviar codigo (202), verificarlo sin gastarlo (204) y
 * cambiar la contrasena con el mismo codigo (204). Sirven tanto para el
 * "olvide mi contrasena" del login como para cambiarla con sesion iniciada.
 */

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(API_ROUTES.auth.login, {
    identifier: data.email.trim().toLowerCase(),
    password: data.password,
  });
}

/**
 * La cuenta queda PENDING_VERIFICATION, sin sesion todavia: hay que confirmar
 * el codigo que llega al correo (ver `verifyEmail`) antes de poder entrar.
 */
export async function register(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  return httpClient.post<RegisterResponse>(API_ROUTES.auth.register, {
    firstName: data.first_name.trim(),
    lastName: data.last_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    username: data.username.trim(),
    password: data.password,
  });
}

/** Confirma el codigo del registro. Si es valido, activa la cuenta y devuelve sesion. */
export async function verifyEmail(
  email: string,
  code: string,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>(API_ROUTES.auth.verifyEmail, {
    email: email.trim().toLowerCase(),
    code: code.trim(),
  });
}

/** Reenvia el codigo de verificacion de cuenta (si vencio o no llego). Siempre responde 202. */
export async function resendEmailVerification(email: string): Promise<void> {
  await httpClient.post<void>(API_ROUTES.auth.resendEmailVerification, {
    email: email.trim().toLowerCase(),
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

/** Responde 204 si el codigo sirve. Si es incorrecto o vencio lanza un ApiError (400). */
export async function verifyCode(data: VerifyCodeRequest): Promise<void> {
  await httpClient.post<void>(API_ROUTES.auth.verifyCode, {
    email: data.email.trim().toLowerCase(),
    code: data.code.trim(),
  });
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<void> {
  await httpClient.post<void>(API_ROUTES.auth.resetPassword, {
    email: data.email.trim().toLowerCase(),
    code: data.code.trim(),
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
