import type { Payment } from "../../../types";

function toApiId(id: string): string | number {
    const numericId = Number(id);
    return Number.isFinite(numericId) ? numericId : id;
}

/**
 * Cuerpo de POST /payments (UploadPaymentRequest, rtm-payment-billing):
 * camelCase, sin `paymentDate` ni `status` (el servidor pone la fecha y
 * siempre nace en PENDING_REVIEW; mandarlos no tenia efecto, los ignoraba).
 */
export function toCreatePaymentPayload(draft: { reservationId: string; bankAccountId: string; amount: number; referenceNumber?: string; receiptFileUrl: string }) {
    return {
        reservationId: toApiId(draft.reservationId),
        bankAccountId: toApiId(draft.bankAccountId),
        amount: draft.amount,
        referenceNumber: draft.referenceNumber ?? null,
        receiptFileUrl: draft.receiptFileUrl,
    };
}

/** PaymentResponse (rtm-payment-billing): camelCase. */
export function toPaymentViewModel(raw: any): Payment {
    return {
        paymentId: String(raw.id),
        reservationId: String(raw.reservationId),
        bankAccountId: String(raw.bankAccountId),
        paymentDate: raw.paymentDate,
        amount: raw.amount,
        referenceNumber: raw.referenceNumber ?? undefined,
        receiptFileUrl: raw.receiptFileUrl,
        status: raw.status,
    };
}
