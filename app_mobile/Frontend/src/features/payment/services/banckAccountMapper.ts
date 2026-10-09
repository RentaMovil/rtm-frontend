import type { BankAccount } from "../../../types";

/**
 * Forma real de BankAccountResponse (rtm-payment-billing): camelCase, con
 * `accountHolder` (no `holderName`) e `isActive` ya como ese nombre exacto.
 * No hay accountNumber/accountType: no existen en ese dominio.
 */
export function toBankAccountViewModel(raw: any): BankAccount {
    return {
        id: String(raw.id),
        bankName: raw.bankName,
        holderName: raw.accountHolder,
        qrImageUrl: raw.qrImageUrl ?? null,
        isActive: raw.isActive,
    };
}
