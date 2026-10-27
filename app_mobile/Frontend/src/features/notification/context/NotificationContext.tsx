import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";

import { notificationService } from "../services/notificationService";

import {
  countUnread,
  type NotificationWithVehicle,
} from "../utils/notificationUtils";

type NotificationContextType = {
  notifications: NotificationWithVehicle[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

type Props = {
  children: ReactNode;
};

/**
 * Estado compartido de notificaciones.
 *
 * Vive por encima de las tabs, y no dentro de la pagina, porque el contador
 * de no leidas tambien lo necesita la campana del header: si la lista viviera
 * en la pagina, al salir de ella el badge perderia el numero.
 *
 * La carga se dispara sola cuando hay sesion, y se vacia cuando se cierra,
 * para no dejar notificaciones de un usuario en memoria al cambiar de cuenta.
 */
export function NotificationProvider({ children }: Props) {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<
    NotificationWithVehicle[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // El backend ya devuelve solo las notificaciones del usuario autenticado (JWT).
      setNotifications(await notificationService.getNotifications());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible obtener las notificaciones.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setError(null);
      return;
    }

    load();
  }, [isAuthenticated, load]);

  /**
   * Marca como leida y actualiza en local con lo que devuelve la API, para que
   * el `read_at` que escribe el servidor quede reflectsido sin recargar.
   */
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const updated = await notificationService.markAsRead(notificationId);

      setNotifications((current) =>
        current.map((n) =>
          n.notification_id === updated.notification_id ? { ...n, ...updated } : n,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No fue posible actualizar la notificación.",
      );
    }
  }, []);

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount: countUnread(notifications),
      isLoading,
      error,
      refresh: load,
      markAsRead,
    }),
    [notifications, isLoading, error, load, markAsRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications debe utilizarse dentro de NotificationProvider",
    );
  }

  return context;
}
