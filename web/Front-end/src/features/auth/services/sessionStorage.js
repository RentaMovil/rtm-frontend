const USER_KEY = "rentamovil_user";
const LEGACY_USER_KEY = "user";
// ADR-005: el refresh token ya no pasa por aquí -- vive solo en la cookie httpOnly que
// pone iam (localStorage es legible por cualquier script, la cookie httpOnly no).

export function saveSession({ user }) {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        localStorage.removeItem(USER_KEY);
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
}
