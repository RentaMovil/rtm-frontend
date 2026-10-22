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
 * Viene de la API real: rtm-booking-reservation expone `GET /reservations`
 * (y `/mine`) y el gateway los enruta sin cambiar la ruta.
 *
 * La API responde en camelCase y con las relaciones como ids sueltos
 * (`vehicleId`, `pickupBranchId`, `returnBranchId`); el `reservationMapper`
 * la aplana a esta forma snake_case y calcula los campos que la API no
 * manda (`days`, `price_per_day`, `insurance_per_day`).
 *
 * `status` llega con el enum de la API (`PENDING_PAYMENT`, `PENDING_REVIEW`,
 * `CONFIRMED`, `CANCELLED`, `COMPLETED`). Se deja como `string`: es la API la
 * que define el conjunto.
 */
export type Reservation = {
  /** Identificador de la reserva (UUID que genera la API). */
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
