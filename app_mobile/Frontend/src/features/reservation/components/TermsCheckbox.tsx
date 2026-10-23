import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useReservation } from "../context/ReservationContext";

import {
  getRentalTermsEffectiveDate,
  getRentalTermsSections,
  RENTAL_TERMS_VERSION,
} from "../data/rentalTerms";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles } from "./TermsCheckbox.styles";

type TermsCheckboxProps = {
  checked: boolean;
  onToggle: (value: boolean) => void;
};

function branchName(branch: { name?: string } | null | undefined): string {
  return branch?.name ?? "—";
}

function formatDate(value: Date | null | undefined): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

/**
 * HU-BOOKING-007: hay que aceptar los terminos antes de confirmar la
 * reserva. rtm-booking-reservation rechaza con 400 si `termsAccepted` no es
 * `true` (CreateReservationRequest), asi que esto no es solo UI: sin
 * marcarla, `createReservation` falla.
 *
 * Antes solo mostraba la casilla con una frase ("He leido y acepto..."),
 * sin ningun sitio donde leer que es lo que en realidad se esta aceptando.
 * Ahora tambien hay un enlace "Ver documento completo" que abre el mismo
 * contenido legal que `web/Front-end` muestra en `TermsAndConditions.jsx`
 * (texto real, no un resumen inventado: ver `reservation.terms.sections` en
 * las traducciones, puerto de `rentalTerms.js`).
 */
export default function TermsCheckbox({ checked, onToggle }: TermsCheckboxProps) {
  const { t } = useTranslation();
  const { reservation } = useReservation();
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  const [isOpen, setIsOpen] = useState(false);

  const sections = getRentalTermsSections(t);
  const effectiveDate = getRentalTermsEffectiveDate(t);

  return (
    <>
      <View style={styles.row}>
        <Pressable
          style={styles.checkRow}
          onPress={() => onToggle(!checked)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
        >
          <View style={[styles.box, checked && styles.boxChecked]}>
            {checked && <Text style={styles.checkMark}>✓</Text>}
          </View>

          <Text style={styles.label}>{t("reservation.terms.accept")}</Text>
        </Pressable>

        <Pressable
          onPress={() => setIsOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t("reservation.terms.viewLink")}
        >
          <Text style={styles.link}>{t("reservation.terms.viewLink")}</Text>
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEyebrow}>
                {t("reservation.terms.documentLabel")}
              </Text>
              <Text style={styles.modalTitle}>{t("reservation.terms.title")}</Text>
              <Text style={styles.modalMeta}>
                {t("reservation.terms.version")}: {RENTAL_TERMS_VERSION} ·{" "}
                {t("reservation.terms.effectiveDateLabel")}: {effectiveDate}
              </Text>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
            >
              {reservation?.vehicle && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>
                    {t("reservation.terms.summaryTitle")}
                  </Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {t("reservation.terms.vehicleLabel")}
                    </Text>
                    <Text style={styles.summaryValue}>
                      {reservation.vehicle.brand} {reservation.vehicle.model}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {t("reservation.terms.pickupLabel")}
                    </Text>
                    <Text style={styles.summaryValue}>
                      {formatDate(reservation.pickupDate)} ·{" "}
                      {branchName(reservation.pickupBranch)}
                    </Text>
                  </View>

                  <View style={[styles.summaryRow, styles.summaryRowLast]}>
                    <Text style={styles.summaryLabel}>
                      {t("reservation.terms.returnLabel")}
                    </Text>
                    <Text style={styles.summaryValue}>
                      {formatDate(reservation.returnDate)} ·{" "}
                      {branchName(reservation.returnBranch)}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.introduction}>
                {t("reservation.terms.introduction")}
              </Text>

              {sections.map((section) => (
                <View key={section.id} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>

                  {section.paragraphs.map((paragraph) => (
                    <Text key={paragraph} style={styles.sectionParagraph}>
                      {paragraph}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setIsOpen(false)}
              >
                <Text style={styles.secondaryButtonText}>
                  {t("reservation.terms.cancelAction")}
                </Text>
              </Pressable>

              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  onToggle(true);
                  setIsOpen(false);
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {t("reservation.terms.acceptAction")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
