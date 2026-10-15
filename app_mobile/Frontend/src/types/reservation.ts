import type { ISODateTime, Money } from "./common";
import type { Branch } from "./branch";
import type { Vehicle } from "./vehicle";

/**
 * Estados de la reserva, segun el dominio del web
 * (`web/Front-end/src/types/reservation.ts`).
 *
 * El ciclo real es:
 *   PENDING_PAYMENT -> (el cliente paga) -> PENDING_REVIEW
 *   -> (un Admin aprueba) -> CONFIRMED -> COMPLETED
 *   cancelable desde PENDING_PAYMENT / PENDING_REVIEW / CONFIRMED
 *
 * NOTA: el mock del web usaba espanol en minuscula ("activa", "cancelada"),
 * mezclado con el codigo que escribia "CANCELLED" en mayusculas. Aqui se
 * adopta el juego del dominio para que ambos coincidan.
 */
export const RESERVATION_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PENDING_REVIEW: "PENDING_REVIEW",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

/**
 * Entity: Reservation (Aggregate Root).
 *
 * NO esta en la API mock: se resuelve con un mock local en la app.
 *
 * Forma: se replica el mock del frontend web
 * (`web/Front-end/src/features/booking/data/mocks/reservationsMocks.js`) con
 * dos ajustes queestableciste:
 *
 *  1. **Normalizada.** El mock trae `vehicle` anidado completo y las
 *     relaciones como ids sueltos; aqui `vehicle` desaparece y solo queda
 *     `vehicleId`. La UI resuelve vehiculo y sucursales por id contra sus
 *     catalogos, igual que haria un backend de verdad.
 *  2. **Aplanada.** `tiempos{}` y `billing{}` se promotes al nivel raiz,
 *     conservando los nombres exactos del mock.
 *
 * `status` llega como texto en espanol minusculo ("activa", "completada",
 * "cancelada"). Se deja como `string`: la API no garantiza el conjunto.
 */
export type Reservation = {
  /** Identificador de negocio legible, ej. "RES-9428". */
  id: string;
  created_at: ISODateTime;
  status: string;
  currency: string;

  /** FK User — titular de la reserva. */
  clientId: string;
  /** FK Vehicle. No se puede cambiar una vez creada. */
  vehicleId: string;
  /** FK InsuranceType. Opcional: como maximo uno por reserva. */
  insuranceTypeId?: string;
  /** FK Branch — sucursal de entrega. */
  pickupBranchId: string;
  /** FK Branch — sucursal de devolucion. */
  returnBranchId: string;

  start_date: ISODateTime;
  end_date: ISODateTime;
  days: number;

  price_per_day: Money;
  subtotal_vehicle: Money;
  insurance_per_day: Money;
  subtotal_insurance: Money;
  total_price: Money;
  insurance_included: boolean;
};

/**
 * Borrador de reserva: lo que la app construye durante el flujo de reserva
 * antes de que exista el endpoint que la persista.
 *
 * A diferencia de `Reservation`, aqui si se guardan los objetos resueltos
 * (`vehicle`, `pickupBranch`) y no sus ids: es estado de UI, no un registro
 * de la API. `buildReservationRequest` es quien aplana esto a ids.
 */
export type ReservationDraft = {
  vehicle: Vehicle;
  insuranceTypeId?: string;
  pickupBranch: Branch;
  returnBranch: Branch;
  pickupDate: Date;
  returnDate: Date;
  /** HU-BOOKING-007: el backend exige termsAccepted=true para crear la reserva. */
  termsAccepted: boolean;
};

/** Payload normalizado que se enviara al backend (FKs, no objetos). */
export type ReservationRequest = {
  vehicleId: string;
  insuranceTypeId?: string;
  pickupBranchId: string;
  returnBranchId: string;
  pickupDate: ISODateTime;
  returnDate: ISODateTime;
  termsAccepted: boolean;
};

/** Respuesta de la creacion de una reserva. */
export type ReservationResponse = {
  reservationId: string;
  status: ReservationStatus;
};
