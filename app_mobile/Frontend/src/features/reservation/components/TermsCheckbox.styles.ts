import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { Spacing } from "../../../theme/constants/spacing";
import { Radius } from "../../../theme/constants/radius";

export const createStyles = (colors: any) => {
  const text = createTextStyles(colors);

  return StyleSheet.create({
    row: {
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.xs,
    },

    checkRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    box: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.sm,
    },

    boxChecked: {
      backgroundColor: colors.button,
      borderColor: colors.button,
    },

    checkMark: {
      color: colors.buttonText,
      fontSize: 14,
      fontWeight: "bold",
    },

    label: {
      ...text.body,
      color: colors.text,
      flex: 1,
    },

    // Enlace para abrir el documento completo. Sangrado para alinear con
    // el texto de la casilla, no con la casilla misma.
    link: {
      ...text.bodyMedium,
      marginLeft: 22 + Spacing.sm,
      color: colors.button,
    },

    /* --- Modal con el documento completo --- */

    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.overlay,
    },

    modalContent: {
      maxHeight: "88%",
      backgroundColor: colors.backgroundCard,
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      borderTopWidth: 1,
      borderColor: colors.cardBorder,
    },

    modalHeader: {
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    modalEyebrow: {
      ...text.overline,
      color: colors.secondaryText,
    },

    modalTitle: {
      ...text.h2,
      marginTop: Spacing.xs,
      color: colors.textHeading,
    },

    modalMeta: {
      ...text.caption,
      marginTop: Spacing.sm,
      color: colors.secondaryText,
    },

    modalBody: {
      flexGrow: 0,
    },

    modalBodyContent: {
      padding: Spacing.lg,
      gap: Spacing.lg,
    },

    summaryCard: {
      padding: Spacing.md,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBg,
    },

    summaryTitle: {
      ...text.label,
      marginBottom: Spacing.sm,
      color: colors.textHeading,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: Spacing.sm,
      paddingVertical: Spacing.xs,
    },

    summaryRowLast: {
      paddingBottom: 0,
    },

    summaryLabel: {
      ...text.caption,
      color: colors.secondaryText,
    },

    summaryValue: {
      ...text.bodyMedium,
      flex: 1,
      textAlign: "right",
      color: colors.text,
    },

    introduction: {
      ...text.body,
      color: colors.text,
      opacity: 0.85,
    },

    section: {
      gap: Spacing.xs,
    },

    sectionTitle: {
      ...text.h3,
      color: colors.textHeading,
    },

    sectionParagraph: {
      ...text.body,
      color: colors.text,
      lineHeight: 21,
    },

    modalFooter: {
      flexDirection: "row",
      gap: Spacing.sm,
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    secondaryButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },

    secondaryButtonText: {
      ...text.bodyMedium,
      color: colors.text,
    },

    primaryButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      backgroundColor: colors.button,
    },

    primaryButtonText: {
      ...text.bodyMedium,
      color: colors.buttonText,
    },
  });
};
