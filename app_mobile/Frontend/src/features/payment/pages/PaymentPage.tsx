import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import ContinueButton from "../../../shared/components/Button/ContinueButton";
import { appAlert } from "../../../shared/components/Alert/AppAlert";

import { useReservation } from "../../reservation/context/ReservationContext";
import { getInsuranceOptions } from "../../insurance/services/insuranceService";
import { isAbortError } from "../../../shared/api/httpClient";

import BankAccountSelector from "../components/BankAccountSelector";
import InvoiceCard from "../components/InvoiceCard";
import ReceiptPicker from "../components/ReceiptPicker";
import ReceiptDeadlineWarning from "../components/ReceiptDeadlineWarning";
import VehiclePaymentCard from "../components/VehiclePaymentCard";

import { usePayment } from "../context/PaymentContext";
import { calculateDays } from "../utils/calculateDays";
import { calculateInvoiceTotal } from "../utils/calculateInvoiceTotal";

import type { InsuranceType, PaymentReceiptFile } from "../../../types";

import { createStyles } from "./PaymentPage.styles";

/**
 * Pantalla de pago.
 *
 * El pago es una **transferencia bancaria manual** revisada por un Admin
 * (INV-004): no hay pasarela. El cliente elige cuenta de destino, sube el
 * comprobante y opcionalmente referencia, y el pago queda en
 * PENDING_REVIEW. El cliente nunca aprueba su propio pago.
 *
 * La reserva ya se creo en su pantalla anterior (nace en PENDING_PAYMENT),
 * asi que aqui no se crea nada: solo se le reporta el pago.
 */
export default function PaymentPage() {
  const { t } = useTranslation();
  const { selectedBankAccount, processPayment, payment, clearPayment } = usePayment();

  const { reservation, createdReservation, clearReservation } = useReservation();

  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceType[]>([]);
  const [receiptFile, setReceiptFile] = useState<PaymentReceiptFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeadlineWarning, setShowDeadlineWarning] = useState(false);

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  useEffect(() => {
    const controller = new AbortController();

    getInsuranceOptions({ signal: controller.signal })
      .then((loaded) => {
        setInsuranceOptions(loaded);
      })
      .catch((error) => {
        if (!isAbortError(error)) console.error("No se pudieron cargar los seguros.", error);
      });

    return () => controller.abort();
  }, []);

  // Verificar si hay 24 horas para enviar el comprobante
  useEffect(() => {
    if (createdReservation?.createdAt) {
      const createdAt = new Date(createdReservation.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      // Mostrar advertencia si faltan menos de 4 horas para las 24 horas
      setShowDeadlineWarning(diffHours > 20 && diffHours < 24);
    }
  }, [createdReservation?.createdAt]);

  const vehicle = reservation?.vehicle;

  const days =
    reservation?.pickupDate && reservation?.returnDate
      ? calculateDays(reservation.pickupDate, reservation.returnDate)
      : 0;

  const selectedInsurance = insuranceOptions.find(
    (item) => item.id === reservation?.insuranceTypeId,
  );

  const total =
    vehicle && days > 0
      ? calculateInvoiceTotal(days, vehicle, selectedInsurance)
      : 0;

  // El dominio exige los tres: reserva, cuenta de destino y comprobante.
  const canPay =
    !!createdReservation && !!selectedBankAccount && !!receiptFile && !isSubmitting;

  // La reserva ya quedo creada en PENDING_PAYMENT en el backend (ver
  // comentario del componente): salir de aqui sin pagar no pierde nada,
  // solo limpia el borrador local. Desde el modulo de reservas se puede
  // retomar el pago con `UploadReceiptModal`.
  function handleUploadLater() {
    clearPayment();
    clearReservation();
    router.replace("/(tabs)/reservations");
  }

  async function handlePayment() {
    if (!canPay || !createdReservation || !selectedBankAccount || !receiptFile) {
      return;
    }

    setIsSubmitting(true);

    try {
      await processPayment({
        reservationId: createdReservation.reservationId,
        bankAccountId: selectedBankAccount.id,
        amount: total,
        receiptFile,
      });

      appAlert.alert(t("payment.reviewAlertTitle"), t("payment.reviewMessage"));
    } catch (error) {
      appAlert.alert(
        t("payment.reviewErrorTitle"),
        error instanceof Error ? error.message : t("errors.unexpected"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (payment) {
    // Se limpia la reserva y el pago del borrador: volver al inicio no debe
    // dejar datos de esta reserva ya enviada para la siguiente.
    const handleGoHome = () => {
      clearPayment();
      clearReservation();
      router.replace("/(tabs)");
    };

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stateTitle}>{t("payment.reviewStateTitle")}</Text>

        <Text style={styles.stateText}>{t("payment.reviewMessage")}</Text>

        <View style={{ marginTop: 24 }}>
          <ContinueButton title={t("payment.goHome")} onPress={handleGoHome} />
        </View>
      </ScrollView>
    );
  }

  if (!createdReservation) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stateTitle}>{t("payment.noReservationTitle")}</Text>

        <Text style={styles.stateText}>{t("payment.noReservationText")}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <VehiclePaymentCard />

      <InvoiceCard />

      <BankAccountSelector />

      {/* Mostrar advertencia si falta menos de 4 horas para las 24 horas */}
      {showDeadlineWarning && <ReceiptDeadlineWarning showWarning={true} />}

      <ReceiptPicker receiptFile={receiptFile} onChange={setReceiptFile} />

      <ContinueButton
        title={isSubmitting ? t("payment.submitting") : t("payment.submit")}
        onPress={handlePayment}
      />

      <TouchableOpacity
        style={styles.uploadLaterLink}
        onPress={handleUploadLater}
        disabled={isSubmitting}
        accessibilityRole="button"
      >
        <Text style={styles.uploadLaterText}>{t("payment.uploadLater")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
