import i18n from '../../../Traductions/index.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
];

/**
 * Valida los datos necesarios para registrar
 * un comprobante de pago.
 *
 * @param {Object} data
 * @param {string|null} data.bankAccountId
 * @param {string|null} data.referenceNumber
 * @param {File|null} data.receiptFile
 * @param {number} data.reservationTotal
 *
 * @returns {{
 *     isValid: boolean,
 *     errors: Object
 * }}
 */
export function validatePayment({
    bankAccountId,
    referenceNumber,
    receiptFile,
    reservationTotal,
}) {
    const errors = {};

    /*
     * Cuenta bancaria destino
     */
    if (!bankAccountId) {
        errors.bankAccountId =
            i18n.t("paymentValidator.bankAccountRequired");
    }

    /*
     * Referencia de transferencia
     */
    if (!referenceNumber?.trim()) {
        errors.referenceNumber =
            i18n.t("paymentValidator.referenceRequired");
    }

    /*
     * Comprobante obligatorio
     */
    if (!receiptFile) {
        errors.receiptFile =
            i18n.t("paymentValidator.receiptRequired");
    } else {
        /*
         * Formato del archivo
         */
        if (!ALLOWED_FILE_TYPES.includes(receiptFile.type)) {
            errors.receiptFile =
                i18n.t("paymentValidator.invalidFormat");
        }

        /*
         * Tamaño máximo
         */
        if (receiptFile.size > MAX_FILE_SIZE) {
            errors.receiptFile =
                i18n.t("paymentValidator.maxSize");
        }
    }

    /*
     * INV-001
     *
     * El monto del pago debe corresponder exactamente
     * al total de la reserva.
     *
     * El monto no se toma de un campo editable del usuario.
     * Se utiliza el total calculado por la reserva.
     */
    if (
        reservationTotal === null ||
        reservationTotal === undefined ||
        Number(reservationTotal) <= 0
    ) {
        errors.amount =
            i18n.t("paymentValidator.totalUnknown");
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}