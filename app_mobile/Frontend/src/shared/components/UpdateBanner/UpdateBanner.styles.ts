import { Platform, StatusBar, StyleSheet } from "react-native";

import { createSoftShadow } from "../../../theme/constants/shadows";
import { Radius } from "../../../theme/constants/radius";

export const createStyles = (colors: any) => {
  const topOffset =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 50;

  return StyleSheet.create({
    container: {
      position: "absolute",
      top: topOffset,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 1000,
      pointerEvents: "box-none",
    },

    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      maxWidth: "92%",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 14,
      ...createSoftShadow(colors),
    },

    text: {
      flexShrink: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: "500",
    },

    button: {
      backgroundColor: colors.button,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: Radius.md,
      minWidth: 70,
      alignItems: "center",
    },

    buttonText: {
      color: colors.buttonText,
      fontSize: 13,
      fontWeight: "700",
    },
  });
};
