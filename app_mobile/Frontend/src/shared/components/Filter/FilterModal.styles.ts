import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { createSoftShadow } from "../../../theme/constants/shadows";
import { Radius } from "../../../theme/constants/radius";
import { Spacing } from "../../../theme/constants/spacing";

/**
 * Hoja de filtros.
 *
 * `close` se elimino: el boton de cerrar paso a ser un icono FontAwesome en
 * el componente, no el caracter "✕" suelto dentro de un `Text`.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.overlay,
    },

    container: {
      height: "90%",
      padding: Spacing.xl,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: colors.backgroundCard,
      borderTopWidth: 1,
      borderColor: colors.cardBorder,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    title: {
      ...text.h2,
      fontSize: 24,
      color: colors.textHeading,
    },

    section: {
      marginBottom: Spacing.xl,
    },

    sectionTitle: {
      ...text.title,
      fontSize: 16,
      marginBottom: Spacing.md,
      color: colors.textHeading,
    },

    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      paddingVertical: 13,
      paddingHorizontal: Spacing.md,
      marginVertical: 4,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },

    optionSelected: {
      borderColor: colors.button,
      backgroundColor: colors.accentBg,
    },

    checkbox: {
      width: 20,
    },

    optionText: {
      ...text.body,
      fontSize: 14,
      color: colors.text,
    },

    optionTextSelected: {
      fontWeight: "600",
      color: colors.textHeading,
    },

    priceContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: Spacing.md,
    },

    priceInputContainer: {
      flex: 1,
    },

    label: {
      ...text.overline,
      marginBottom: 6,
      color: colors.secondaryText,
    },

    input: {
      ...text.body,
      padding: 11,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      backgroundColor: colors.input,
      fontSize: 14,
      color: colors.text,
    },

    priceSeparator: {
      marginTop: 20,
      fontSize: 18,
      color: colors.secondaryText,
    },

    invalidPrice: {
      ...text.caption,
      marginTop: 5,
      color: colors.error,
    },

    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: Spacing.md,
      paddingTop: Spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    clearButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      backgroundColor: colors.card,
    },

    clearButtonText: {
      ...text.label,
      color: colors.secondaryText,
    },

    applyButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: Radius.md,
      backgroundColor: colors.button,
      ...createSoftShadow(colors),
    },

    applyButtonText: {
      ...text.label,
      color: colors.buttonText,
    },
  });
};
