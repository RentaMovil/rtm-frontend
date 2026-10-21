import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePayment } from "../context/PaymentContext";
import "./PaymentReceiptUpload.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
];

/**
 * Contenido de la carga del comprobante. El encabezado de la
 * sección ("Comprobante de pago" + badge "Obligatorio") lo aporta
 * Payment.jsx (PaySectionHeader), igual que en el resto de
 * tarjetas de la página de pago.
 */
export default function PaymentReceiptUpload() {
    const { t } = useTranslation();
    const {
        payment,
        setReceiptFile,
    } = usePayment();

    const inputRef = useRef(null);

    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const receiptFile = payment?.receiptFile;

    /**
     * Genera una vista previa únicamente para imágenes.
     *
     * La URL creada aquí es temporal y solamente pertenece
     * a la interfaz. NO representa una URL del backend.
     */
    useEffect(() => {
        if (!receiptFile) {
            setPreviewUrl(null);
            return;
        }

        if (!receiptFile.type.startsWith("image/")) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(receiptFile);

        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [receiptFile]);

    /**
     * Valida y guarda el archivo seleccionado.
     */
    function handleFileChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError(null);

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError(
                t("paymentValidator.invalidFormat")
            );

            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                t("paymentValidator.maxSize")
            );

            event.target.value = "";
            return;
        }

        setReceiptFile(file);
    }

    /**
     * Abre el selector de archivos.
     */
    function handleOpenFilePicker() {
        inputRef.current?.click();
    }

    /**
     * Elimina el comprobante seleccionado.
     */
    function handleRemoveFile() {
        setReceiptFile(null);
        setError(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    /**
     * Permite arrastrar un archivo sobre la zona de carga.
     */
    function handleDrop(event) {
        event.preventDefault();

        const file = event.dataTransfer.files?.[0];

        if (!file) {
            return;
        }

        setError(null);

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError(
                t("paymentValidator.invalidFormat")
            );
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                t("paymentValidator.maxSize")
            );
            return;
        }

        setReceiptFile(file);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    /**
     * Convierte bytes a una unidad legible.
     */
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return (
        <div className="payment-receipt-body">
            <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                onChange={handleFileChange}
                hidden
            />

            {!receiptFile ? (
                <button
                    type="button"
                    className="payment-receipt-dropzone"
                    onClick={handleOpenFilePicker}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <span className="payment-receipt-upload-icon">
                        ↑
                    </span>

                    <strong>
                        {t("paymentReceiptUpload.selectReceipt")}
                    </strong>

                    <span>
                        {t("paymentReceiptUpload.dropHint")}
                    </span>

                    <small>
                        {t("paymentReceiptUpload.formatHint")}
                    </small>
                </button>
            ) : (
                <div className="payment-receipt-file">
                    <div className="payment-receipt-file-info">
                        <div className="payment-receipt-file-icon">
                            {receiptFile.type === "application/pdf"
                                ? "PDF"
                                : "IMG"}
                        </div>

                        <div className="payment-receipt-file-details">
                            <strong>
                                {receiptFile.name}
                            </strong>

                            <span>
                                {formatFileSize(receiptFile.size)}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="payment-receipt-remove"
                        onClick={handleRemoveFile}
                    >
                        {t("paymentReceiptUpload.remove")}
                    </button>
                </div>
            )}

            {previewUrl && (
                <div className="payment-receipt-preview">
                    <span>{t("paymentReceiptUpload.preview")}</span>

                    <img
                        src={previewUrl}
                        alt={t("paymentReceiptUpload.previewAlt")}
                    />
                </div>
            )}

            {error && (
                <p
                    className="payment-receipt-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
