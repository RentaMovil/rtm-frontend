import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";

/**
 * Selector del comprobante.
 *
 * El area de arrastre mantiene el borde punteado, que el web usa tambien
 * para los separadores; la cabecera pasa al formato de tarjeta con punto de
 * acento que define `createCardStyles`.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    header: {
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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

    placeholder: {
      height: 130,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.cardBorder,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: colors.input,
    },

    placeholderIcon: {
      marginBottom: 2,
    },

    placeholderText: {
      ...text.bodyMedium,
      color: colors.button,
    },

    preview: {
      width: "100%",
      height: 220,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.input,
    },

    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
    },

    action: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
    },

    dangerAction: {
      borderColor: colors.error,
    },

    actionText: {
      ...text.label,
      fontSize: 14,
    },

    dangerText: {
      color: colors.error,
    },
  });
};
