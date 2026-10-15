import type FontAwesome from "@expo/vector-icons/FontAwesome";
import type { ComponentProps } from "react";

import type { Notification, Vehicle } from "../../../types";

type FontAwesomeName = ComponentProps<typeof FontAwesome>["name"];

/**
 * Utilidades de notificaciones.
 *
 * Espejo de `web/Front-end/src/features/notification/utils/notificationsUtils.js`.
 *
 * Diferencia deliberada: el web devuelve los estados como texto en espanol
 * hardcodeado ("Activa", "Cancelada"...). Aqui se devuelven claves de i18n,
 * porque la app tiene 4 idiomas y ese texto saldia siempre en espanol.
 */

export const NOTIFICATION_TYPES = [
  "reserva_confirmada",
  "pago_confirmado",
  "reserva_cancelada",
  "recordatorio",
] as const;

export const NOTIFICATION_FILTERS = ["todos", ...NOTIFICATION_TYPES] as const;

export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number];

export type NotificationWithVehicle = Notification & {
  vehicle: Vehicle | null;
};

/** Clave de i18n para la etiqueta de cada filtro de la lista. */
export const FILTER_LABEL_KEY: Record<string, string> = {
  todos: "notifications.all",
  reserva_confirmada: "notifications.confReservations",
  pago_confirmado: "notifications.pays",
  reserva_cancelada: "notifications.cancel",
  recordatorio: "notifications.recordatory",
};

/** Clave de i18n del estado que muestra el detalle. */
export const STATUS_LABEL_KEY: Record<string, string> = {
  reserva_confirmada: "notifications.statusActive",
  pago_confirmado: "notifications.statusPayment",
  reserva_cancelada: "notifications.statusCancelled",
  recordatorio: "notifications.statusPending",
};

export const STATUS_FALLBACK_LABEL_KEY = "notifications.statusUnknown";

/**
 * Icono por tipo, para que la lista se lea sin abrir el detalle.
 *
 * Se tipa con el union real de `FontAwesome` en vez de `string`: si el mapa
 * devuelve `string`, `<FontAwesome name={...}>` no compila, porque React
 * Native no acepta un nombre de icono arbitrario en tiempo de ejecucion.
 */
export const TYPE_ICON: Record<string, FontAwesomeName> = {
  reserva_confirmada: "check-circle",
  pago_confirmado: "credit-card",
  reserva_cancelada: "times-circle",
  recordatorio: "bell",
};

export function filterByType(
  notifications: NotificationWithVehicle[],
  filter: NotificationFilter,
): NotificationWithVehicle[] {
  if (filter === "todos") return notifications;

  return notifications.filter((n) => n.type === filter);
}

export function countUnread(notifications: NotificationWithVehicle[]): number {
  return notifications.filter((n) => !n.is_read).length;
}

/**
 * Adjunta el vehiculo a cada notificacion.
 *
 * La API guarda solo el `vehicle_id`; el nombre y el modelo hay que sacarlos
 * de `/vehicles`. Es el mismo `attachVehicleToNotifications` del web.
 *
 * Nota: el web muestra `vehicle.name`, campo que `Vehicle` no tiene. Aqui se
 * usa `brand`, que si existe.
 */
export function attachVehicle(
  notifications: Notification[],
  vehicles: Vehicle[],
): NotificationWithVehicle[] {
  const vehiclesById = new Map(vehicles.map((vehicle) => [String(vehicle.id), vehicle]));

  return notifications.map((n) => ({
    ...n,
    vehicle: n.vehicle_id ? (vehiclesById.get(String(n.vehicle_id)) ?? null) : null,
  }));
}
