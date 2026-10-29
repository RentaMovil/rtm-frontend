import { StyleSheet } from "react-native";

import { Radius } from "../../../theme/constants/radius";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      padding: 22,
    },
    container: {
      borderRadius: 18,
      padding: 22,
      backgroundColor: colors.backgroundCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.secondaryText,
      marginBottom: 6,
    },
    name: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textHeading,
    },
    tag: {
      alignSelf: "flex-start",
      marginTop: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.pill,
      backgroundColor: colors.input,
    },
    tagText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.text,
    },
    description: {
      marginTop: 14,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      opacity: 0.85,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 18,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.secondaryText,
    },
    value: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textHeading,
    },
    closeButton: {
      marginTop: 20,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: colors.primary,
    },
    closeText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.buttonText,
    },
  });
