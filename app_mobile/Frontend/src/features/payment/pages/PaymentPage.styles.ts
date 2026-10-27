import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { Spacing } from "../../../theme/constants/spacing";

export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    content: {
      padding: Spacing.lg,
      paddingBottom: 40,
      backgroundColor: colors.background,
    },

    stateTitle: {
      ...text.h2,
      color: colors.textHeading,
    },

    stateText: {
      ...text.body,
      marginTop: Spacing.sm,
      color: colors.secondaryText,
    },

    uploadLaterLink: {
      alignItems: "center",
      marginTop: Spacing.md,
      padding: Spacing.sm,
    },

    uploadLaterText: {
      ...text.label,
      color: colors.secondaryText,
      textDecorationLine: "underline",
    },
  });
};
