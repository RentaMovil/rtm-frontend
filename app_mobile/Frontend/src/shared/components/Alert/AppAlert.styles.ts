import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { createSoftShadow } from "../../../theme/constants/shadows";
import { Radius } from "../../../theme/constants/radius";
import { Spacing } from "../../../theme/constants/spacing";

export const createStyles = (colors: any) => {
  const text = createTextStyles(colors);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: Spacing.xl,
      backgroundColor: colors.overlay,
    },

    container: {
      width: "100%",
      maxWidth: 360,
      padding: Spacing.xl,
      borderRadius: Radius.lg,
      backgroundColor: colors.backgroundCard,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      ...createSoftShadow(colors),
    },

    title: {
      ...text.h2,
      fontSize: 18,
      color: colors.textHeading,
      marginBottom: Spacing.sm,
    },

    message: {
      ...text.body,
      fontSize: 14,
      color: colors.text,
      marginBottom: Spacing.xl,
    },

    buttonsRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: Spacing.md,
    },

    buttonsColumn: {
      flexDirection: "column",
      gap: Spacing.sm,
    },

    button: {
      paddingVertical: 10,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
    },

    buttonFullWidth: {
      width: "100%",
    },

    defaultButton: {
      backgroundColor: colors.button,
    },

    cancelButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },

    destructiveButton: {
      backgroundColor: colors.error,
    },

    buttonText: {
      ...text.label,
      color: colors.buttonText,
    },

    cancelButtonText: {
      color: colors.secondaryText,
    },

    destructiveButtonText: {
      color: "#FFFFFF",
    },
  });
};
