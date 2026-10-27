import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";

/**
 * Advertencia de plazo para enviar el comprobante de pago.
 */
export const createStyles = (colors: any) => {
  const text = createTextStyles(colors);

  return StyleSheet.create({
    warningContainer: {
      flexDirection: "row",
      gap: 12,
    },

    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
    },

    icon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.error,
      position: "absolute",
      opacity: 0.1,
    },

    iconText: {
      fontSize: 20,
    },

    textContainer: {
      flex: 1,
      gap: 4,
    },

    title: {
      ...text.title,
      fontSize: 16,
      fontWeight: "700",
      color: colors.error,
    },

    message: {
      ...text.bodyMedium,
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },

    deadlineDate: {
      fontWeight: "700",
      color: colors.primary,
    },

    deadlineTime: {
      fontWeight: "700",
      color: colors.primary,
    },

    consequences: {
      ...text.caption,
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
    },
  });
};
