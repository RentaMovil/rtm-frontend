import { httpClient } from "../../../shared/api/httpClient";
import { uploadPaymentReceipt } from "./paymentReceiptService";
import type { BankAccount, Payment, PaymentDraft } from "../../../types";
import { toBankAccountViewModel } from "./banckAccountMapper";
import { toCreatePaymentPayload, toPaymentViewModel } from "./paymentMapper";

// GET /bank-accounts (rtm-payment-billing), no /bankAccounts: el gateway solo enruta
// /payments/**, /invoices/** y /bank-accounts/** hacia ese servicio.
export async function getActiveBankAccounts(): Promise<BankAccount[]> {
    const raw = await httpClient.get<any[]>("/bank-accounts");
    return raw.filter((account) => account.isActive).map(toBankAccountViewModel);
}

export async function createPayment(draft: PaymentDraft): Promise<Payment> {
    if (!draft.reservationId) {
        throw new Error("Falta el ID de la reserva para registrar el pago.");
    }
    if (!draft.bankAccountId) {
        throw new Error("Falta la cuenta bancaria destino del pago.");
    }
    if (!draft.receiptFile) {
        throw new Error("Falta el comprobante de pago.");
    }

    const receiptFileUrl = await uploadPaymentReceipt(draft.receiptFile);

    const raw = await httpClient.post<any>("/payments", toCreatePaymentPayload({
        reservationId: draft.reservationId,
        bankAccountId: draft.bankAccountId,
        amount: draft.amount,
        referenceNumber: draft.referenceNumber,
        receiptFileUrl,
    }));

    // No hace falta mover la reserva a PENDING_REVIEW a mano: al subir el pago,
    // rtm-payment-billing manda el evento PaymentSubmitted a booking-reservation
    // (POST /internal/events), que es quien cambia el estado (BookingEventForwarderAdapter).
    return toPaymentViewModel(raw);
}
