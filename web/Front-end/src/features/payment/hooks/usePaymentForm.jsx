import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePayment } from "../context/PaymentContext";
import { useReservation } from "../../booking/context/ReservationContext";


import { calculateDays } from "../utils/calculateDays";
import { calculateInvoiceTotal } from "../utils/calculateIvoiceTotal";

import { isValidTermsAcceptance } from "../../booking/data/rentalTerms";

import { validatePayment } from "../validators/paymentValidator";

import { useInsurance } from "../../admin/insuranceTypes/hooks/useInsurance";
import { reservationService } from "../../booking/services/reservationService";
import { paymentService } from "../services/paymentService";

export function usePaymentForm() {
    const { t } = useTranslation();
    const { payment, markAsPendingReview } = usePayment();
    const { reservation } = useReservation();
    const { insurance } = useInsurance();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentErrors, setPaymentErrors] = useState({});

    /**
     * Cantidad de días de la reserva.
     */
    const days = useMemo(() => {
        if (
            !reservation.pickupDate ||
            !reservation.returnDate
        ) {
            return 0;
        }

        return calculateDays(
            reservation.pickupDate,
            reservation.returnDate
        );
    }, [
        reservation.pickupDate,
        reservation.returnDate,
    ]);

    /**
     * Seguro seleccionado.
     */
    const selectedInsurance = useMemo(() => {
        return insurance.find(
            (item) =>
                item.id === reservation.insuranceId
        );
    }, [
        // insurance llega de la API después del primer render: sin esta dependencia el
        // seguro elegido no se encuentra y su subtotal queda en 0
        insurance,
        reservation.insuranceId,
    ]);

    /**
     * Calcula los valores de la factura.
     *
     * Vehículo:
     * precio × días
     *
     * Seguro:
     * una sola vez por reserva
     *
     * Total:
     * vehículo + seguro
     */
    const invoice = useMemo(() => {
        const vehicle = reservation.vehicle;

        if (!vehicle || days <= 0) {
            return {
                vehicleSubtotal: 0,
                insuranceSubtotal: 0,
                totalAmount: 0,
            };
        }

        return calculateInvoiceTotal(
            days,
            vehicle,
            selectedInsurance
        );
    }, [
        days,
        reservation.vehicle,
        selectedInsurance,
    ]);

    const {
        vehicleSubtotal,
        insuranceSubtotal,
        totalAmount,
    } = invoice;

    const hasValidTermsAcceptance = useMemo(() => {
        return isValidTermsAcceptance(
            reservation.termsAcceptance
        );
    }, [reservation.termsAcceptance]);

    /**
     * Verifica que la información necesaria
     * para crear la Reservation esté completa.
     */
    const canCreateReservation = useMemo(() => {
        return Boolean(
            reservation.vehicle?.vehicleId &&
            reservation.pickupBranch?.id &&
            reservation.returnBranch?.id &&
            reservation.pickupDate &&
            reservation.returnDate &&
            days > 0 &&
            totalAmount > 0 &&
            hasValidTermsAcceptance
        );
    }, [
        reservation.vehicle?.vehicleId,
        reservation.pickupBranch?.id,
        reservation.returnBranch?.id,
        reservation.pickupDate,
        reservation.returnDate,
        days,
        totalAmount,
        hasValidTermsAcceptance,
    ]);

    /**
     * Valida la información necesaria para enviar
     * el Payment.
     *
     * Las reglas de negocio se mantienen fuera
     * de la interfaz.
     */
    const paymentValidation = useMemo(() => {
        return validatePayment({
            bankAccountId:
                payment?.bankAccountId,

            referenceNumber:
                payment?.referenceNumber,

            receiptFile:
                payment?.receiptFile,

            reservationTotal:
                totalAmount,
        });
    }, [
        payment?.bankAccountId,
        payment?.referenceNumber,
        payment?.receiptFile,
        totalAmount,
    ]);

    /**
     * El Payment puede enviarse únicamente cuando
     * todas sus validaciones son correctas.
     */
    const canSubmitPayment =
        paymentValidation.isValid;

    /**
     * El botón principal utiliza una única condición
     * para determinar si puede ejecutarse el flujo.
     *
     * No se crea un "canReserve" separado.
     */
    const canSubmit =
        canCreateReservation &&
        canSubmitPayment;

    /**
     * Crea una Reservation en PENDING_PAYMENT.
     */
    async function createPendingReservation() {
        if (!canCreateReservation || isProcessing) return null;

        try {
            setIsProcessing(true);

            // Los montos de arriba son solo para mostrar: booking calcula los reales
            // y el titular sale del token.
            const reservationResponse = await reservationService.create(reservation);

            return reservationResponse;
        } catch (error) {
            console.error("Error creando la reserva:", error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }

    /**
     * Registra el Payment después de crear
     * correctamente la Reservation.
     */
    async function submitPayment(reservationResponse) {
        if (!reservationResponse || !canSubmitPayment || isProcessing) return null;

        const reservationId = reservationResponse.id; // el backend/mock devuelve `id`, no `reservationId`

        if (!reservationId) {
            throw new Error(t("payment.missingReservationId"));
        }

        const paymentData = {
            reservationId,
            bankAccountId: payment.bankAccountId,
            // El monto a pagar es el que calculó booking, no el estimado de la pantalla
            amount: reservationResponse.total_amount ?? totalAmount,
            referenceNumber: payment.referenceNumber?.trim() || null,
            receiptFile: payment.receiptFile,
        };

        const paymentResponse = await paymentService.create(paymentData);
        markAsPendingReview();
        return paymentResponse;
    }


    /**
     * Flujo completo:
     *
     * 1. Validar Reservation.
     * 2. Validar Payment.
     * 3. Crear Reservation.
     * 4. Obtener reservationId.
     * 5. Crear Payment.
     * 6. Payment → PENDING_REVIEW.
     *
     * No se aprueba el pago desde el frontend.
     */
    async function handlePayment() {
        setPaymentErrors({});
        if (!canSubmit || isProcessing) {
            setPaymentErrors(paymentValidation.errors);
            return null;
        }

        try {
            setIsProcessing(true);

            // Los montos de arriba son solo para mostrar: booking calcula los reales
            // y el titular sale del token.
            const reservationResponse = await reservationService.create(reservation);

            const paymentResponse = await submitPayment(reservationResponse);

            return { reservation: reservationResponse, payment: paymentResponse };
        } catch (error) {
            console.error("Error en el proceso de reserva y pago:", error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }
    return {
        // Información de la reserva
        days,

        // Valores de facturación
        vehicleSubtotal,
        insuranceSubtotal,
        total: totalAmount,

        // Información del Payment
        payment,

        // Validaciones
        canCreateReservation,
        canSubmitPayment,
        canSubmit,
        paymentErrors,

        // Estado
        isProcessing,

        // Acciones
        createPendingReservation,
        submitPayment,
        handlePayment,
    };
}
