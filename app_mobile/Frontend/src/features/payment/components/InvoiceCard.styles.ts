import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { createSoftShadow } from "../../../theme/constants/shadows";

/**
 * Resumen de factura.
 *
 * Vocabulario tomado de
 * `web/Front-end/src/features/payment/components/InvoiceCard.css`:
 * separador punteado (`.pay-divider`), total grande con etiqueta pequena
 * (`.pay-total-label` / `.pay-total-amount`) y badge de estado
 * (`.pay-status-badge`).
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    headerText: {
      flex: 1,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.button,
    },

    title: {
      ...text.title,
      fontSize: 18,
      fontWeight: "700",
      color: colors.textHeading,
    },

    subtitle: {
      ...text.caption,
      marginTop: 6,
      color: colors.text,
      opacity: 0.75,
    },

    // El web usa un caret; aqui se mantiene el triangulo de texto por no
    // depender de un icono nuevo, pero con la tipografia correcta.
    arrow: {
      ...text.bodyMedium,
      color: colors.button,
    },

    content: {
      gap: 16,
    },

    vehicleSection: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    vehicleName: {
      ...text.h3,
      fontSize: 17,
      color: colors.textHeading,
    },

    vehicleDescription: {
      ...text.caption,
      marginTop: 4,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },

    rowText: {
      flex: 1,
    },

    // `.pay-resumen-label`: 15px, apagado.
    label: {
      ...text.body,
      fontSize: 15,
      color: colors.textHeading,
      opacity: 0.85,
    },

    description: {
      ...text.caption,
      marginTop: 3,
    },

    // `.pay-resumen-value`: 16px/700.
    value: {
      ...text.body,
      fontSize: 16,
      fontWeight: "700",
      color: colors.textHeading,
    },

    // `.pay-divider`: punteado, no solido.
    separator: {
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
      borderStyle: "dashed",
      marginVertical: 4,
    },

    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 12,
      paddingTop: 18,
    },

    totalInfo: {
      flex: 1,
      gap: 4,
    },

    // `.pay-total-label`: 12px/700 con letter-spacing.
    totalLabel: {
      ...text.overline,
    },

    // `.pay-total-amount`: 32px/800, line-height 1.
    total: {
      ...text.h1,
      fontSize: 32,
      fontWeight: "800",
      lineHeight: 32,
      color: colors.textHeading,
    },

    // `.pay-status-badge`: pastilla de estado con punto.
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      marginTop: 14,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.success,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.success,
    },

    statusText: {
      ...text.caption,
      fontSize: 13,
      fontWeight: "600",
      color: colors.success,
    },

    // `.pay-warning-box`: aviso con tinte de acento.
    warningBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginTop: 8,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },

    warningIcon: {
      marginTop: 1,
    },

    warningText: {
      ...text.caption,
      flex: 1,
      lineHeight: 19,
      color: colors.textHeading,
    },

    // Superficie del comprobante, para que el aviso no quede plano.
    notice: {
      ...createSoftShadow(colors),
    },
  });
};
