import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { Spacing } from "../../../theme/constants/spacing";

export const createStyles = (colors: any) => {
  const text = createTextStyles(colors);

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
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
      backgroundColor: colors.primary,
      borderColor: colors.primary,
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
  });
};
