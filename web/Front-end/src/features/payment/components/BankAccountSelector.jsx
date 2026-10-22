import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { usePayment } from "../context/PaymentContext";
import { bankAccountService } from "../../admin/bankAccounts/services/bankAccountService";
import { toBankAccountViewModel } from "../../admin/bankAccounts/services/bankAccountMapper";
import "./BankAccountSelector.css";


/**
 * Grilla de cuentas bancarias seleccionables. El encabezado de la
 * sección ("Selecciona tu cuenta bancaria destino" + el hint del QR)
 * lo aporta Payment.jsx a través de PaySectionHeader, para que el
 * título/subtítulo se vea igual en todas las secciones de la página.
 */
export default function BankAccountSelector() {
    const { t } = useTranslation();
    const { payment, updatePayment } = usePayment();
    const [isExpanded, setIsExpanded] = useState(() => !payment?.bankAccountId);
    const [activeAccounts, setActiveAccounts] = useState([]);

    useEffect(() => {
        bankAccountService.getAll()
            .then((accounts) => setActiveAccounts(accounts.map(toBankAccountViewModel)))
            .catch(() => setActiveAccounts([]));
    }, []);

    const selectedAccount = activeAccounts.find(
        (account) => account.id === payment?.bankAccountId
    );

    const handleSelect = (account) => {
        updatePayment({
            bankAccountId: account.id,
        });
        setIsExpanded(false);
    };

    return (
        <div className="bank-account-selector">
            <button
                type="button"
                className="bank-account-toggle"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((expanded) => !expanded)}
            >
                <span className="bank-account-toggle-copy">
                    <strong>
                        {selectedAccount && !isExpanded
                            ? t("bankAccountSelector.selectedAccount", { bankName: selectedAccount.bankName })
                            : isExpanded
                              ? t("bankAccountSelector.hideAccounts")
                              : t("bankAccountSelector.selectAccount")}
                    </strong>
                    <small>
                        {isExpanded
                            ? t("bankAccountSelector.chooseAccountHint")
                            : t("bankAccountSelector.toggleHint")}
                    </small>
                </span>
                {isExpanded ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
            </button>

            {isExpanded && (
                <div className="bank-account-grid">
            {activeAccounts.map((account) => {
                const isSelected = payment?.bankAccountId === account.id;

                return (
                    <div
                        key={account.id}
                        onClick={() => handleSelect(account)}
                        className={`bank-account-card ${
                            isSelected ? "bank-account-selected" : ""
                        }`}
                    >
                        {/* Encabezado del Banco */}
                        <div className="bank-account-title">
                            <div className="bank-account-info">
                                <div className="bank-account-logo default">
                                    {account.bankName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <strong>{account.bankName}</strong>
                                    <small>{t("bankAccountSelector.bankAccount")}</small>
                                </div>
                            </div>

                            <div
                                className={`bank-account-radio ${
                                    isSelected ? "active" : ""
                                }`}
                            >
                                {isSelected && (
                                    <div className="bank-account-radio-dot" />
                                )}
                            </div>
                        </div>

                        {/* Datos del Titular */}
                        <div className="bank-account-holder">
                            <div>
                                <strong>{t("bankAccountSelector.holder")}</strong> {account.holderName}
                            </div>
                        </div>

                        {/* Sección del Código QR */}
                        <div className="bank-account-qr">
                            <p className="bank-account-qr-title">
                                <span className="bank-account-qr-icon">📱</span>
                                {t("bankAccountSelector.qrFor", { bankName: account.bankName.toUpperCase() })}
                            </p>

                            <div className="bank-account-qr-frame">
                                <img
                                    src={account.qrImageUrl}
                                    alt={t("bankAccountSelector.qrAlt", { bankName: account.bankName })}
                                />
                            </div>

                            <small className="bank-account-qr-subtitle">
                                {t("bankAccountSelector.scanToTransfer")}{" "}
                                <strong>App {account.bankName}</strong>
                            </small>

                            {/* Acciones y Etiquetas Inferiores */}
                            <div className="bank-account-qr-footer">
                                <a
                                    href={account.qrImageUrl}
                                    download
                                    className="bank-account-download-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    📥 {t("uploadReceipt.downloadQr")}
                                </a>
                                <span className="bank-account-dot-separator">
                                    •
                                </span>
                                <span className="bank-account-tag-badge">
                                    {account.tagLabel || t("bankAccountSelector.noFeeTag")}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
                </div>
            )}
        </div>
    );
}
