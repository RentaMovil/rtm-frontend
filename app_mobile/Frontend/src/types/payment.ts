import type { ISODateTime, Money } from "./common";

/**
 * Entity: Payment (Aggregate Root).
 * Espejo de `web/Front-end/src/types/payment.ts` y del contrato documentado
 * en `web/Front-end/src/features/payment/services/PaymentServices.js`.
 *
 * IMPORTANTE — el pago es **transferencia bancaria manual revisada por un
 * Admin** (INV-004). No hay pasarela automatica: por eso NO existen campos de
 * tarjeta (numero, CVV, vencimiento) ni `transactionId` de gateway. El
 * concepto anterior `PaymentMethod` (metodos de tarjeta) queda obsoleto y se
 * reemplaza por `BankAccount` + `receiptFileUrl`.
 *
 * A diferencia del resto del dominio, aqui `status` SI es una union cerrada:
 * el web la declara asi en su tipo de dominio y el cliente no decide el
 * resultado, solo lo espera.
 */
export type PaymentStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type Payment = {
  paymentId: string;
  /** FK Reservation. */
  reservationId: string;
  /** FK BankAccount — la cuenta a la que el cliente transfirio. */
  bankAccountId: string;
  /** Fecha en que el cliente registro la transferencia. */
  paymentDate: ISODateTime;
  /** Debe coincidir exactamente con `reservation.total_price`. */
  amount: Money;
  /** Referencia de la transaccion, tal como la reporta el cliente. Opcional. */
  referenceNumber?: string;
  /** Comprobante de pago subido por el cliente. Obligatorio. */
  receiptFileUrl: string;
  status: PaymentStatus;
  /** FK User — Admin que reviso el comprobante. `null` mientras PENDING_REVIEW. */
  reviewedBy?: string;
  reviewedAt?: ISODateTime;
  /** Solo cuando `status === "REJECTED"`. */
  rejectionReason?: string;
};

export type PaymentReceiptFile = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

/**
 * Payload de `createPayment`.
 *
 * `receiptFile` conserva los datos locales del archivo para subirlo antes de
 * crear el pago y guardar una URL accesible en `receiptFileUrl`.
 */
export type PaymentDraft = {
  reservationId: string;
  bankAccountId: string;
  amount: Money;
  referenceNumber?: string;
  receiptFile: PaymentReceiptFile;
};
