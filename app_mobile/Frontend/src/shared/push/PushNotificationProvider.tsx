import { ReactNode, useEffect, useRef } from "react";

import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import { useAuth } from "../../features/auth/context/AuthContext";
import { useNotifications } from "../../features/notification/context/NotificationContext";

import { registerForPushNotificationsAsync } from "./pushTokenService";

// Mientras la app esta abierta, mostrar el push igual (banner + sonido), no solo dejarlo
// en la barra de notificaciones del sistema.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Props = {
  children: ReactNode;
};

/**
 * Registra el token de push cuando hay sesion activa, y conecta los pushes con el
 * mismo estado de notificaciones que ya usa la pantalla de notificaciones:
 *
 * - Con la app en primer plano, un push que llega no se "cree" tal cual: dispara
 *   `refresh()` para traer la fila real desde la API (misma fuente de verdad que la
 *   campanita en vivo del web).
 * - Al tocar el push (app en background o cerrada), navega a la pantalla de
 *   notificaciones y tambien refresca, por la misma razon.
 */
export function PushNotificationProvider({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const { refresh } = useNotifications();
  const router = useRouter();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      registeredRef.current = false;
      return;
    }

    if (registeredRef.current) {
      return;
    }
    registeredRef.current = true;

    void registerForPushNotificationsAsync();
  }, [isAuthenticated]);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      void refresh();
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      void refresh();
      router.push("/notifications");
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [refresh, router]);

  return <>{children}</>;
}
