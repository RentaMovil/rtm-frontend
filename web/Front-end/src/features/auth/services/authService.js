import { httpClient, refreshSession } from "../../../shared/api/httpClient";
import { tokenStore } from "../../../shared/api/tokenStore";
import { toLoginPayload, toRegisterPayload, toAuthUserViewModel } from "./authMapper";
import {
    saveSession,
    getStoredUser,
    clearSession,
} from "./sessionStorage";

const RESOURCE = "/auth";
// ADR-005: con este header, iam manda el refresh token por cookie httpOnly en vez del body.
const WEB_CLIENT_HEADERS = { headers: { "X-Client-Platform": "web" }, credentials: "include" };

export const authService = {
    async login(credentials) {
        const response = await httpClient.post(
            `${RESOURCE}/login`,
            toLoginPayload(credentials),
            WEB_CLIENT_HEADERS
        );
        const user = toAuthUserViewModel(response);

        tokenStore.setAccessToken(response.accessToken);
        saveSession({ user });

        return { user };
    },

    // La cuenta queda PENDING_VERIFICATION: no hay sesión todavía, hay que confirmar el código
    // que llega al correo (ver verifyEmail) antes de poder entrar.
    async register(formData) {
        const response = await httpClient.post(
            `${RESOURCE}/register`,
            toRegisterPayload(formData)
        );

        return { email: response.email };
    },

    // Confirma el código del registro. Si es válido, activa la cuenta y ya devuelve sesión,
    // igual que login -- no hay que loguearse dos veces.
    async verifyEmail(email, code) {
        const response = await httpClient.post(
            `${RESOURCE}/email/verify`,
            { email, code },
            WEB_CLIENT_HEADERS
        );
        const user = toAuthUserViewModel(response);

        tokenStore.setAccessToken(response.accessToken);
        saveSession({ user });

        return { user };
    },

    // Reenvía el código de verificación de cuenta (si venció o no llegó)
    resendEmailVerification: (email) =>
        httpClient.post(`${RESOURCE}/email/resend`, { email }),

    // El mismo refresh que usa httpClient ante un 401: si ya hay uno en curso se reutiliza.
    // El refresh token va solo en la cookie httpOnly; si no hay sesión, iam responde 401.
    refreshSession,

    async logout() {
        try {
            // Sin body: iam lee el refresh token de la cookie y la limpia en la respuesta.
            await httpClient.post(`${RESOURCE}/logout`, undefined, WEB_CLIENT_HEADERS);
        } catch {
            // La sesión local se limpia aunque el servidor no responda.
        }

        tokenStore.clear();
        clearSession();
    },

    async getProfile() {
        const response = await httpClient.get(`/users/me`);
        return toAuthUserViewModel(response);
    },

    // PATCH /users/me (iam): solo cambia nombre, apellido, teléfono y foto.
    // El username no se puede cambiar y el email va por /users/me/email.
    // Solo viajan los campos que vengan en `changes` (los undefined no se mandan).
    async updateProfile(changes) {
        const response = await httpClient.patch("/users/me", {
            firstName: changes.firstName,
            lastName: changes.lastName,
            phone: changes.phone,
            imageUrl: changes.imageUrl,
        });

        return toAuthUserViewModel(response);
    },

    getStoredUser,

    // Recuperar contraseña (iam). Sin SMTP todavía: el código sale en el log de iam.
    forgotPassword: (email) =>
        httpClient.post(`${RESOURCE}/password/forgot`, { email }),

    // Verificar codigo
    verifyCode: (email, code) =>
        httpClient.post(`${RESOURCE}/password/verify-code`, { email, code }),

    // { email, code, newPassword }. El código se vuelve a validar aquí; verifyCode solo lo comprueba antes, sin gastarlo.
    resetPassword: (payload) =>
        httpClient.post(`${RESOURCE}/password/reset`, payload),

    // iam cierra todas las sesiones al cambiarla: después hay que iniciar sesión de nuevo
    changePassword: (currentPassword, newPassword) =>
        httpClient.patch(
            "/users/me/password",
            { currentPassword, newPassword }
        ),
    async changeEmail(newEmail, currentPassword) {
        const response = await httpClient.patch("/users/me/email", {
            newEmail,
            currentPassword,
        });

        return toAuthUserViewModel(response);
    },
};
