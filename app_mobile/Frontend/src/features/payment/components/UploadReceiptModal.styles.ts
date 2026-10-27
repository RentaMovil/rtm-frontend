import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { Spacing } from "../../../theme/constants/spacing";

export const createStyles = (colors: any) => {
  const text = createTextStyles(colors);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.overlay,
    },

    container: {
      height: "88%",
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
      marginBottom: Spacing.md,
    },

    title: {
      ...text.h2,
      fontSize: 20,
      color: colors.textHeading,
    },

    closeText: {
      fontSize: 24,
      color: colors.secondaryText,
    },

    content: {
      paddingBottom: Spacing.xl,
      gap: Spacing.md,
    },
  });
};
