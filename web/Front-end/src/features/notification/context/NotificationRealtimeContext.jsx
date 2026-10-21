/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { useNotificationStream } from "../../../shared/hooks/useNotificationStream";
import ToastStack from "../../../shared/components/notifications/ToastStack";
import { getNotifications } from "../services/notificationService";

const TOAST_DURATION_MS = 6000;

const NotificationRealtimeContext = createContext(null);

export function NotificationRealtimeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnseenCount, setAdminUnseenCount] = useState(0);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((message) => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // Cuenta real de no leídas (igual que la campanita): se recalcula al conectar y tras cada
  // notificación en vivo, para que el badge no se desincronice si hay otra pestaña abierta.
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const notifications = await getNotifications();
      setUnreadCount(notifications.filter((item) => !item.is_read).length);
    } catch {
      // si falla, se queda con el último valor conocido
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
      setAdminUnseenCount(0);
    }
  }, [isAuthenticated, refreshUnreadCount]);

  const clearAdminUnseen = useCallback(() => setAdminUnseenCount(0), []);

  useNotificationStream({
    onNotification: (payload) => {
      pushToast(payload.message);
      refreshUnreadCount();
    },
    onAdminNotification: (payload) => {
      pushToast(payload.message);
      setAdminUnseenCount((count) => count + 1);
    },
  });

  const value = { unreadCount, refreshUnreadCount, adminUnseenCount, clearAdminUnseen };

  return (
    <NotificationRealtimeContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </NotificationRealtimeContext.Provider>
  );
}

export function useNotificationRealtime() {
  const context = useContext(NotificationRealtimeContext);

  if (!context) {
    throw new Error("useNotificationRealtime debe utilizarse dentro de NotificationRealtimeProvider");
  }

  return context;
}
