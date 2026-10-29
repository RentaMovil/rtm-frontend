import { API_ROUTES } from "../../../config/env";
import { httpClient, type HttpRequestOptions } from "../../../shared/api/httpClient";
import { vehicleService } from "../../vehicles/services/vehicleService";

import type { Notification } from "../../../types";

import {
    attachVehicle,
    type NotificationWithVehicle,
} from "../utils/notificationUtils";

// Tipos de booking (enum backend) -> tipos que muestra la interfaz
// (NOTIFICATION_TYPES). Los que no tienen equivalente visual caen en
// "recordatorio". Mismo mapa que usa el web
// (`web/Front-end/src/features/notification/services/notificationService.js`).
const UI_TYPE: Record<string, string> = {
    PAYMENT_APPROVED: "pago_confirmado",
    RESERVATION_CANCELLED: "reserva_cancelada",
    RESERVATION_EXPIRED: "reserva_cancelada",
};

type ApiNotification = {
    id: number;
    type: string;
    message: string;
    sentDate: string;
    read: boolean;
    reservationId?: number;
};

/**
 * Respuesta de rtm-booking-reservation (camelCase, sin `personId`: el
 * endpoint ya devuelve solo las del usuario autenticado, via JWT) -> forma
 * que usan los componentes (snake_case).
 */
function fromApiNotification(notification: ApiNotification): Notification {
    return {
        notification_id: notification.id,
        person_id: "",
        type: UI_TYPE[notification.type] ?? "recordatorio",
        message: notification.message,
        sent_date: notification.sentDate,
        is_read: notification.read,
        reservation_id: notification.reservationId,
        // Booking no guarda el vehiculo en la notificacion; el mensaje ya lo describe.
        vehicle_id: undefined,
    };
}

/**
 * Servicio de notificaciones contra la API real.
 *
 * `GET /notifications` ya devuelve solo las del usuario autenticado
 * (NotificationController las filtra por el personId del JWT, no por query
 * param), asi que aqui no se vuelve a filtrar por personId.
 */
export const notificationService = {
    async getNotifications(options?: HttpRequestOptions): Promise<NotificationWithVehicle[]> {
        const response = await httpClient.get<ApiNotification[]>(API_ROUTES.notifications, options);
        const notifications = response.map(fromApiNotification);

        const vehicles = await vehicleService.getVehicles(undefined, options);

        return attachVehicle(notifications, vehicles);
    },

  async markAsRead(notificationId: number): Promise<Notification> {
    return httpClient.patch<Notification>(
      `${API_ROUTES.notifications}/${notificationId}/read`,
    );
  },
};
