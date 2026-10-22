/**
 * Entidad: Notification.
 *
 * UNICA EXCEPCION a la regla "src/types/ es espejo de web/Front-end/src/types/".
 *
 * El web declara un tipo formal (`web/Front-end/src/types/notification.ts`) en
 * camelCase, con `notificationId` como UUID y `personId` obligatorio. Ese tipo
 * no es lo que sirve la API: rtm-booking-reservation expone la coleccion
 * `notifications` en snake_case, con `notification_id` numerico.
 *
 * Decision: la API real es la fuente de verdad del proyecto, asi que aqui se
 * replica la forma que llega. Es el mismo criterio que ya se aplica con
 * `users` (snake_case) frente a `vehicles` (camelCase): los nombres se
 * replican tal cual, no se "normalizan" por cuenta propia. Si algun dia hace
 * falta mapear al tipo formal, ese mapeo vive en el service.
 */
export type Notification = {
  notification_id: number;
  /** FK Person: destinatario. La API permite filtrar por el con query param. */
  person_id: string;
  /**
   * Texto libre, no union cerrada: la API define los valores y puede crecer
   * (`NOTIFICATION_TYPES` es la lista conocida, no un limite). Mismo criterio
   * que `Vehicle.status`.
   */
  type: string;
  message: string;
  sent_date: string;
  is_read: boolean;
  /** INV-001: al menos una de las FK de abajo debe venir presente. */
  reservation_id?: number;
  invoice_id?: number;
  payment_id?: number;
  maintenance_id?: number;
  vehicle_id?: string;
  /** Lo anade `PATCH /notifications/:id/read`; no esta en la semilla. */
  read_at?: string;
};
