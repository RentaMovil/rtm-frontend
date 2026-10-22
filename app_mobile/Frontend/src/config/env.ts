import { Platform } from "react-native";

/**
 * Configuracion de entorno.
 *
 * `EXPO_PUBLIC_API_URL` lo expone Expo en build time. Se lee desde
 * `app.json > expo.extra.apiUrl` para no depender del bundler.
 */

const DEFAULT_DEV_PORT = 8080;

/**
 * Host por defecto para desarrollo.
 *
 * `localhost` no sirve en un dispositivo fisico (ahi localhost es el propio
 * telefono) ni en el emulador de Android (que usa 10.0.2.2 como alias del
 * host). Por eso se resuelve segun la plataforma.
 */
function devDefaultHost(): string {
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_DEV_PORT}`;
  }

  return `http://localhost:${DEFAULT_DEV_PORT}`;
}

function readApiUrl(): string {
  const fromExtra = process.env.EXPO_PUBLIC_API_URL;

  if (fromExtra && fromExtra.length > 0) {
    return fromExtra.replace(/\/+$/, "");
  }

  return devDefaultHost();
}

export const API_URL = readApiUrl();

export const IS_API_CONFIGURED = Boolean(process.env.EXPO_PUBLIC_API_URL);

/**
 * Direcciones tipadas de la API.
 *
 * Auth, vehicles y notifications van contra el gateway real (rtm-api-gateway),
 * que las enruta a iam y fleet-maintenance. Branches y reservations/rentals
 * se agregan aqui a medida que se conectan sus servicios reales
 * (fleet-maintenance y booking-reservation).
 */
export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    // ProfileController vive en /users/me (sin StripPrefix), no bajo /auth: el
    // gateway solo quita el prefijo "/auth" para AuthController (login/register/
    // refresh/logout), que vive en la raiz. /users/** se enruta tal cual.
    me: "/users/me",
    // Recuperar contrasena (iam, PasswordController): el gateway los deja pasar
    // sin sesion y limita la frecuencia. Enviar codigo -> verificarlo -> cambiar.
    forgotPassword: "/auth/password/forgot",
    verifyCode: "/auth/password/verify-code",
    resetPassword: "/auth/password/reset",
    changePassword: "/users/me/password",
    // PATCH /users/me/email (ChangeEmailRequest): newEmail/currentPassword. Sin
    // paso de verificacion por codigo en este flujo (distinto a forgotPassword).
    changeEmail: "/users/me/email",
    // El registro ya no deja logueado (queda PENDING_VERIFICATION, HU-IAM-001):
    // hay que confirmar este codigo antes de poder entrar.
    verifyEmail: "/auth/email/verify",
    resendEmailVerification: "/auth/email/resend",
  },
  vehicles: "/vehicles",
  branches: "/branches",
  reservations: "/reservations",
  rentals: "/rentals",
  notifications: "/notifications",
} as const;
