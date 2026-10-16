import React, { useState } from "react";
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
                    "No fue posible registrar el pago. Intenta de nuevo."
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
            setSubmitError(error?.message ?? "No fue posible crear la reserva. Intenta de nuevo.");
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
                            ? "No hay reserva disponible."
                            : !hasValidTermsAcceptance
                                ? "Debes aceptar los términos y condiciones antes de continuar al pago."
                                : "La reserva está incompleta. Regresa y completa los datos antes de pagar."}
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
                            ¡Pago enviado!
                        </h2>

                        <p className="pay-success-text">
                            Registramos tu comprobante y tu reserva quedó
                            <strong> pendiente de revisión</strong>. Un
                            administrador validará la transferencia y te
                            notificaremos cuando quede confirmada.
                        </p>

                        <ContinueButton
                            title="Volver al inicio"
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
                            <PaySectionHeader title="Detalles del vehículo" />
                            <VehicleReservationCard vehicle={reservation.vehicle} />
                        </section>

                        <section className="pay-card">
                            <PaySectionHeader
                                title="Selecciona tu cuenta bancaria destino"
                                subtitle="💡 Escanea el código QR directamente desde la app de tu banco."
                            />
                            <BankAccountSelector />
                        </section>

                        <section className="pay-card">
                            <PaySectionHeader
                                title="Registrar transferencia"
                                subtitle="Ingresa los datos correspondientes a la transferencia realizada."
                            />
                            <TransferDetails />
                        </section>

                        <section className="pay-card">
                            <PaySectionHeader
                                title="Comprobante de pago"
                                subtitle="Adjunta el comprobante correspondiente a la transferencia realizada."
                                badge="Para pagar ahora"
                            />
                            <PaymentReceiptUpload />
                        </section>
                    </div>

                    <aside className="pay-side-column">
                        <section className="pay-card pay-invoice-card">
                            <PaySectionHeader title="Resumen de factura" />
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
                                    Procesando tu pago...
                                </div>
                            ) : (
                                <>
                                    <ContinueButton
                                        title="Reservar y enviar comprobante"
                                        onPress={handleSubmit}
                                        disabled={!canSubmit}
                                    />
                                    {/* INV-015: la reserva espera el pago 24 h en PENDING_PAYMENT */}
                                    <ContinueButton
                                        title="Reservar y pagar después"
                                        onPress={handleReserveOnly}
                                        disabled={!canCreateReservation}
                                    />
                                    <p className="pay-later-note">
                                        Si reservas sin pagar, tienes 24 horas para subir el comprobante
                                        desde "Mis reservas". Pasado ese plazo la reserva se cancela sola.
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
