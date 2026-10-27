import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import { appAlert } from "../../../shared/components/Alert/AppAlert";
import ContinueButton from "../../../shared/components/Button/ContinueButton";

import { usePayment } from "../context/PaymentContext";
import BankAccountSelector from "./BankAccountSelector";
import ReceiptPicker from "./ReceiptPicker";

import type { PaymentReceiptFile } from "../../../types";

import { createStyles } from "./UploadReceiptModal.styles";

type Props = {
  visible: boolean;
  reservationId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
};

/**
 * Modal para subir el comprobante de una reserva que ya quedo en
 * PENDING_PAYMENT ("Subir comprobante despues", mismo patron que
 * `UploadReceiptModal` del web). No repite el flujo de reserva: solo pide
 * cuenta bancaria y comprobante, y crea el Payment con la reserva que ya
 * existe.
 */
export default function UploadReceiptModal({
  visible,
  reservationId,
  amount,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const { selectedBankAccount, processPayment, clearPayment } = usePayment();
  const [receiptFile, setReceiptFile] = useState<PaymentReceiptFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  const canSubmit = !!selectedBankAccount && !!receiptFile && !isSubmitting;

  function handleClose() {
    if (isSubmitting) return;
    clearPayment();
    setReceiptFile(null);
    onClose();
  }

  async function handleSubmit() {
    if (!canSubmit || !selectedBankAccount || !receiptFile) return;

    setIsSubmitting(true);

    try {
      await processPayment({
        reservationId,
        bankAccountId: selectedBankAccount.id,
        amount,
        receiptFile,
      });

      clearPayment();
      setReceiptFile(null);
      onSuccess();
    } catch (error) {
      appAlert.alert(
        t("payment.reviewErrorTitle"),
        error instanceof Error ? error.message : t("errors.unexpected"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("uploadReceipt.modalTitle")}</Text>

            <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <BankAccountSelector />

            <ReceiptPicker receiptFile={receiptFile} onChange={setReceiptFile} />
          </ScrollView>

          <ContinueButton
            title={isSubmitting ? t("payment.submitting") : t("historyReservation.uploadReceipt")}
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}
