import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { bankAccountService } from "../../admin/bankAccounts/services/bankAccountService";
import { toBankAccountViewModel } from "../../admin/bankAccounts/services/bankAccountMapper";
import { paymentService } from "../../payment/services/paymentService";
import "./UploadReceiptModal.css";

/**
 * Modal chico para subir el comprobante de una reserva que ya existe en PENDING_PAYMENT
 * ("Reservar y pagar después"). A diferencia de Payment.jsx no repite el resto del flujo
 * de reserva: solo pide cuenta bancaria, referencia y el archivo. paymentService.create ya
 * sube el archivo a Cloudinary antes de crear el Payment (mismo patrón que Payment.jsx).
 */
export default function UploadReceiptModal({ reservation, onClose, onSuccess }) {
  const { t } = useTranslation();
    const [bankAccounts, setBankAccounts] = useState([]);
    const [bankAccountId, setBankAccountId] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        bankAccountService.getAll()
            .then((accounts) => setBankAccounts(accounts.map(toBankAccountViewModel)))
            .catch(() => setError(t("uploadReceipt.loadError")));
    }, []);

    const selectedAccount = bankAccounts.find((a) => String(a.id) === String(bankAccountId));

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setReceiptFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bankAccountId || !referenceNumber.trim() || !receiptFile) {
            setError("Completa la cuenta bancaria, la referencia y el comprobante.");
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await paymentService.create({
                reservationId: reservation.id,
                bankAccountId: Number(bankAccountId),
                amount: reservation.billing.total_price,
                referenceNumber: referenceNumber.trim(),
                receiptFile,
            });
            onSuccess?.();
        } catch (err) {
            setError(err.message || "No se pudo subir el comprobante.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="urm-overlay" onClick={onClose}>
            <div className="urm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="urm-header">
                    <h3>Subir comprobante — Reserva #{reservation.id}</h3>
                    <button type="button" className="urm-close" onClick={onClose} aria-label={t("uploadReceipt.close")}>×</button>
                </div>

                <form className="urm-form" onSubmit={handleSubmit}>
                    <label className="urm-field">
                        Cuenta bancaria destino
                        <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} required>
                            <option value="">{t("uploadReceipt.selectAccount")}</option>
                            {bankAccounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.bankName} — {a.holderName}</option>
                            ))}
                        </select>
                    </label>

                    {selectedAccount?.qrImageUrl && (
                        <div className="urm-qr">
                            <img src={selectedAccount.qrImageUrl} alt={`QR de ${selectedAccount.bankName}`} />
                            <a
                                href={selectedAccount.qrImageUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="urm-qr-download"
                            >
                                Descargar QR
                            </a>
                        </div>
                    )}

                    <label className="urm-field">
                        Número de referencia
                        <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Como aparece en el comprobante"
                            required
                        />
                    </label>

                    <label className="urm-field">
                        Comprobante (imagen o PDF)
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} required />
                    </label>

                    <div className="urm-total">
                        Total a transferir: <strong>${reservation.billing.total_price.toLocaleString("es-CO")} COP</strong>
                    </div>

                    {error && <p className="urm-error">{error}</p>}

                    <div className="urm-footer">
                        <button type="button" className="urm-btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="urm-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Subiendo..." : "Subir comprobante"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
