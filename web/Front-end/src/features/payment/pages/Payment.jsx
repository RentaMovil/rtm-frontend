import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Componentes Web del proyecto
import VehicleReservationCard from "../../booking/components/VehicleReservationCard";
import { RoleNavbar, RoleFooter } from "../../../shared/components/layout/RoleChrome";
import InvoiceCard from "../components/InvoiceCard";
import BankAccountSelector from "../components/BankAccountSelector";
import ContinueButton from "../../../shared/components/continueButton";
import PaymentReceiptUpload from "../components/PaymentReceiptUpload";
import TransferDetails from "../components/TransferDetails";

// Hooks de lógica de negocio
import { usePaymentForm } from "../hooks/usePaymentForm";
import { useReservation } from "../../booking/context/ReservationContext";
import { isValidTermsAcceptance } from "../../booking/data/rentalTerms";
import { usePayment } from "../context/PaymentContext";

import "./Payment.css";


function PaySectionHeader({ title, subtitle, badge }) {
    return (
        <div className="pay-card-header">
            <div className="pay-card-header-text">
                <div className="pay-card-header-title-row">
                    <span className="pay-card-dot" />
                    <h2 className="pay-card-title">{title}</h2>
                </div>

                {subtitle && (
                    <p className="pay-card-subtitle">{subtitle}</p>
                )}
            </div>

            {badge && (
                <span className="pay-card-badge">{badge}</span>
            )}
        </div>
    );
}

export default function PaymentPage() {
  const { t } = useTranslation();

    const navigate = useNavigate();

    const { reservation, clearReservation } = useReservation();
    const { clearPayment } = usePayment();

    const {
        canSubmit,
        canCreateReservation,
        isProcessing,
        handlePayment,
        createPendingReservation,
        days,
        total,
    } = usePaymentForm();


    const [submitError, setSubmitError] = useState(null);
    const [submitted, setSubmitted] = useState(false);


    const handleSubmit = async () => {
        setSubmitError(null);

        try {
            await handlePayment();
            setSubmitted(true);
        } catch (error) {
            console.error("Error al enviar el pago:", error);

            setSubmitError(
                error?.message ??
                    t("payment.registerError")
            );
        }
    };

    // Crea la reserva en PENDING_PAYMENT sin comprobante: el cliente paga dentro de las 24 h
    const handleReserveOnly = async () => {
        setSubmitError(null);

        try {
            await createPendingReservation();
            clearReservation();
            clearPayment();
            navigate("/HistorialReservation");
        } catch (error) {
            setSubmitError(error?.message ?? t("payment.createReservationError"));
        }
    };

    const handleBackToHome = () => {
        clearReservation();
        clearPayment();
        navigate("/home");
    };

    const hasValidTermsAcceptance = isValidTermsAcceptance(
        reservation?.termsAcceptance
    );

    if (
        (
            !reservation?.vehicle ||
            !hasValidTermsAcceptance ||
            !canCreateReservation
        ) &&
        !submitted
    ) {
        return (
            <>
                <RoleNavbar />
                <div className="pay-page-container">
                    <p className="pay-empty-state">
                        {!reservation?.vehicle
                            ? t("payment.noReservation")
                            : !hasValidTermsAcceptance
                                ? t("terms.acceptError")
                                : t("payment.reservationIncomplete")}
                    </p>
                </div>
                <RoleFooter />
            </>
        );
    }

    if (submitted) {
        return (
            <>
                <RoleNavbar />

                <div className="pay-page-container">
                    <section className="pay-card pay-success">
                        <span className="pay-success-icon">✓</span>

                        <h2 className="pay-success-title">
                            {t("payment.sentTitle")}
                        </h2>

                        <p className="pay-success-text">
                            {t("payment.sentTextBefore")}
                            <strong> {t("payment.sentTextStrong")}</strong>
                            {t("payment.sentTextAfter")}
                        </p>

                        <ContinueButton
                            title={t("payment.backToHome")}
                            onPress={handleBackToHome}
                        />
                    </section>
                </div>

                <RoleFooter />
            </>
        );
    }

    return (
        <>
            <RoleNavbar />

            <div className="pay-page-container">

                {/* Vehículo seleccionado */}
                <div className="pay-layout">
                    <div className="pay-main-column">
                        <section className="pay-card pay-vehicle-section">
                            <PaySectionHeader title={t("payment.vehicleDetails")} />
                            <VehicleReservationCard vehicle={reservation.vehicle} />
                        </section>

                        <section className="pay-card">
                            <PaySectionHeader
                                title={t("payment.selectBank")}
                                subtitle={t("payment.selectBankSubtitle")}
                            />
                            <BankAccountSelector />
                        </section>

                        <section className="pay-card">
                            <PaySectionHeader
                                title={t("payment.registerTransfer")}
                                subtitle={t("payment.registerTransferSubtitle")}
                            />
                            <TransferDetails />
                        </section>

                        <section className="pay-card">
                            <PaySectionHeader
                                title={t("payment.receiptTitle")}
                                subtitle={t("payment.receiptSubtitle")}
                                badge={t("payment.payNowBadge")}
                            />
                            <PaymentReceiptUpload />
                        </section>
                    </div>

                    <aside className="pay-side-column">
                        <section className="pay-card pay-invoice-card">
                            <PaySectionHeader title={t("payment.invoiceSummary")} />
                            <InvoiceCard
                                days={days}
                                total={total}
                                vehicle={reservation.vehicle}
                            />
                        </section>

                        <div className="pay-submit-panel">
                            {submitError && (
                                <p className="pay-error-banner" role="alert">
                                    {submitError}
                                </p>
                            )}

                            {isProcessing ? (
                                <div className="pay-loading">
                                    <span className="pay-spinner" aria-hidden="true" />
                                    {t("payment.processing")}
                                </div>
                            ) : (
                                <>
                                    <ContinueButton
                                        title={t("payment.reserveAndSendReceipt")}
                                        onPress={handleSubmit}
                                        disabled={!canSubmit}
                                    />
                                    {/* INV-015: la reserva espera el pago 24 h en PENDING_PAYMENT */}
                                    <ContinueButton
                                        title={t("payment.reserveAndPayLater")}
                                        onPress={handleReserveOnly}
                                        disabled={!canCreateReservation}
                                    />
                                    <p className="pay-later-note">
                                        {t("payment.payLaterNote")}
                                    </p>
                                </>
                            )}
                        </div>
                    </aside>
                </div>

            </div>

            <RoleFooter />
        </>
    );
}
