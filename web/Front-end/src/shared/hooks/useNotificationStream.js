import { useEffect, useRef } from "react";

import { authService } from "../../features/auth/services/authService";
import { tokenStore } from "../api/tokenStore";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const RECONNECT_DELAY_MS = 3000;

/**
 * Campanita en vivo: un EventSource al stream SSE de booking-reservation.
 *
 * EventSource no puede mandar el header Authorization, así que el token va en la URL
 * (ver NotificationStreamController / CurrentUserArgumentResolver en el backend).
 * Solo se refresca el token si hace falta (primer intento sin token, o tras un error) para
 * no rotar el refresh token en cada reconexión.
 */
export function useNotificationStream({ onNotification, onAdminNotification } = {}) {
  const { isAuthenticated } = useAuth();
  const handlersRef = useRef({ onNotification, onAdminNotification });
  handlersRef.current = { onNotification, onAdminNotification };

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let cancelled = false;
    let source = null;
    let retryTimer = null;

    const connect = async (forceRefresh) => {
      if (cancelled) return;

      let token = tokenStore.getAccessToken();
      if (!token || forceRefresh) {
        try {
          await authService.refreshSession();
          token = tokenStore.getAccessToken();
        } catch {
          return; // sin sesión válida: no insiste, la próxima navegación la restaura
        }
      }
      if (cancelled || !token) return;

      source = new EventSource(`${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`);

      source.addEventListener("notification", (event) => {
        handlersRef.current.onNotification?.(JSON.parse(event.data));
      });
      source.addEventListener("admin-notification", (event) => {
        handlersRef.current.onAdminNotification?.(JSON.parse(event.data));
      });
      source.onerror = () => {
        source.close();
        if (!cancelled) {
          retryTimer = setTimeout(() => connect(true), RECONNECT_DELAY_MS);
        }
      };
    };

    connect(false);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [isAuthenticated]);
}
