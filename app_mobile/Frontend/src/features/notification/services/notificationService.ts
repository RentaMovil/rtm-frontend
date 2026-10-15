import { API_ROUTES } from "../../../config/env";
import { httpClient } from "../../../shared/api/httpClient";
import { vehicleService } from "../../vehicles/services/vehicleService";

import type { Notification } from "../../../types";

import {
    attachVehicle,
    type NotificationWithVehicle,
} from "../utils/notificationUtils";

/**
 * Servicio de notificaciones contra la API mock.
 *
 * A diferencia de `insuranceService` o `branchService`, aqui la entidad SI
 * existe en la API: la coleccion `notifications` de `db.json`. Por eso se
 * consume por HTTP real, sin mock local.
 *
 * Los endpoints son los mismos que consume el web
 * (`web/Front-end/src/features/notification/services/notificationService.js`),
 * que tiene ese camino escrito pero desactivado por no tener `VITE_API_URL`.
 *
 * `PATCH /notifications/:id/read` persiste `is_read` en `db.json`, asi que
 * marcar como leida sobrevive a recargar. El web, al no tener API, solo lo
 * cambia en memoria y lo pierde.
 */
export const notificationService = {
  /**
  * @param personId si se pasa, filtra las notificaciones por destinatario.
   */
  async getNotifications(
    personId?: string,
  ): Promise<NotificationWithVehicle[]> {
    const response = await httpClient.get<Notification[]>(API_ROUTES.notifications);
    const notifications = personId
      ? response.filter((notification) => String(notification.person_id) === String(personId))
      : response;

    const vehicles = await vehicleService.getVehicles();

    return attachVehicle(notifications, vehicles);
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    return httpClient.patch<Notification>(
      `${API_ROUTES.notifications}/${notificationId}`,
      { is_read: true, read_at: new Date().toISOString() },
    );
  },
};
