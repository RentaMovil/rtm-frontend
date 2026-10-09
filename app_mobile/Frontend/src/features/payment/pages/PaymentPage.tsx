import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import ContinueButton from "../../../shared/components/Button/ContinueButton";

import { useReservation } from "../../reservation/context/ReservationContext";
import { getInsuranceOptions } from "../../insurance/services/insuranceService";

import BankAccountSelector from "../components/BankAccountSelector";
import InvoiceCard from "../components/InvoiceCard";
import ReceiptPicker from "../components/ReceiptPicker";
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
  const { selectedBankAccount, processPayment, payment, clearPayment } = usePayment();

  const { reservation, createdReservation, clearReservation } = useReservation();

  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceType[]>([]);
  const [receiptFile, setReceiptFile] = useState<PaymentReceiptFile | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  useEffect(() => {
    let cancelled = false;

    getInsuranceOptions().then((loaded) => {
      if (!cancelled) {
        setInsuranceOptions(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

  async function handlePayment() {
    if (!canPay || !createdReservation || !selectedBankAccount || !receiptFile) {
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await processPayment({
        reservationId: createdReservation.reservationId,
        bankAccountId: selectedBankAccount.id,
        amount: total,
        ...(referenceNumber ? { referenceNumber } : {}),
        receiptFile,
      });

      Alert.alert(
        "Pago registrado",
        "Tu pago quedo en revision. Un administrador lo confirmara y la reserva pasara a confirmada.",
      );

      console.log("Pago creado:", created);
    } catch (error) {
      Alert.alert(
        "No se pudo registrar el pago",
        error instanceof Error ? error.message : "Error inesperado.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (payment) {
    // Se limpia la reserva y el pago del borrador: volver al menu no debe
    // dejar datos de esta reserva ya enviada para la siguiente.
    const handleGoToMenu = () => {
      clearPayment();
      clearReservation();
      router.replace("/menu");
    };

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stateTitle}>Pago en revision</Text>

        <Text style={styles.stateText}>
          Tu pago quedo registrado y esta esperando que un administrador lo
          confirme.
        </Text>

        <View style={{ marginTop: 24 }}>
          <ContinueButton title="Volver al menu" onPress={handleGoToMenu} />
        </View>
      </ScrollView>
    );
  }

  if (!createdReservation) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stateTitle}>No hay una reserva activa</Text>

        <Text style={styles.stateText}>
          Crea primero una reserva para poder registrar su pago.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <VehiclePaymentCard />

      <InvoiceCard />

      <BankAccountSelector />

      <ReceiptPicker receiptFile={receiptFile} onChange={setReceiptFile} />

      <ContinueButton
        title={isSubmitting ? "Enviando..." : "Registrar pago"}
        onPress={handlePayment}
      />
    </ScrollView>
  );
}
