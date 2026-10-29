import i18n from '../../Traductions/index.js';
import { tokenStore } from './tokenStore.js';

// /api es la ruta del proxy de Vite (vite.config.js) hacia el api-gateway.
const API_URL = import.meta.env.VITE_API_URL || '/api';

let refreshPromise = null;
async function rawRequest(endpoint, { method = 'GET', body, headers = {}, credentials } = {}) {
    const token = tokenStore.getAccessToken();
    return fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        // Solo /auth/login, /auth/email/verify, /auth/refresh y /auth/logout lo necesitan: son
        // los únicos que ponen o leen la cookie httpOnly del refresh token (ADR-005).
        ...(credentials && { credentials }),
    });
}

// ADR-005: el refresh token ya no se lee de localStorage ni se manda en el body -- vive en una
// cookie httpOnly que el navegador adjunta solo (iam la puso con Set-Cookie en el login). El
// header X-Client-Platform le dice a iam que responda así, en vez del body que usa mobile.
async function refreshAccessToken() {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Client-Platform': 'web' },
    });

    if (!res.ok) throw new Error(i18n.t('common.httpErrors.refreshFailed'));

    const data = await res.json();
    tokenStore.setAccessToken(data.accessToken);
    // iam ya rotó el refresh token y lo volvió a mandar por Set-Cookie: no hay nada que guardar acá.
    return data;
}

// Un solo refresh a la vez para toda la app (el de AuthContext al recargar y el de cualquier 401).
// Dos refresh con el mismo token = iam lo toma como reuso y cierra todas las sesiones.
export function refreshSession() {
    if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

// Mensajes pensados para leerse en pantalla: el status y el endpoint no significan nada
// para quien está usando la app.
function friendlyMessages() {
    return {
        404: i18n.t('common.httpErrors.notFound'),
        401: i18n.t('common.httpErrors.sessionExpired'),
        403: i18n.t('common.httpErrors.forbidden'),
        409: i18n.t('common.httpErrors.conflict'),
        429: i18n.t('common.httpErrors.tooManyAttempts'),
        503: i18n.t('common.httpErrors.serviceUnavailable'),
    };
}

function friendlyError(res, endpoint, body) {
    const status = res.status;
    // Si el backend manda un mensaje en español, tiene prioridad sobre el genérico.
    const message = body?.message || friendlyMessages()[status]
        || i18n.t('common.httpErrors.generic');
    const error = new Error(message);
    // Se conserva lo técnico para la consola, pero no se muestra en pantalla.
    error.status = status;
    error.endpoint = endpoint;
    // code: el "error" del backend (ej. ACCOUNT_BLOCKED). retryAfter: segundos del Retry-After
    // que pone el rate limit del gateway (el login lo muestra en el 429)
    error.code = body?.error ?? null;
    const retryAfter = Number(res.headers.get('Retry-After'));
    error.retryAfter = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null;
    if (!body?.message) {
        console.warn(`[http] ${status} en ${endpoint}`);
    }
    return error;
}

async function request(endpoint, options = {}) {
    // Si la sesión se está renovando, se espera el token nuevo en vez de salir sin él
    if (refreshPromise) {
        await refreshPromise.catch(() => {});
    }
    let res = await rawRequest(endpoint, options);

    // Un 401 por contraseña actual incorrecta (cambiar correo/contraseña) no es un token vencido
    const wrongPassword = res.status === 401
        && (await res.clone().json().catch(() => null))?.error === 'INCORRECT_PASSWORD';

    // Si expiro el access token, intenta refrescar UNA vez y reintenta la peticion original
    if (res.status === 401 && !wrongPassword && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        try {
            await refreshSession();
            res = await rawRequest(endpoint, options);
        } catch {
            tokenStore.clear();
            tokenStore.triggerRefreshFail(); // el authService decide qué hacer (ej. redirigir a /Login)
            throw new Error(i18n.t('common.httpErrors.sessionExpired'));
        }
    }

    if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw friendlyError(res, endpoint, errorBody);
    }

    // 204, o 202 sin cuerpo (ej. /auth/password/forgot): no hay JSON que leer
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export const httpClient = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body, extra) => request(endpoint, { method: 'POST', body, ...extra }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};