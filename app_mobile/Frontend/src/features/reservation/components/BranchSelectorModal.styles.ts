import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";

/**
 * Hoja inferior para elegir sucursal de devolucion.
 *
 * El overlay usaba `colors.overlay`, clave que no existia en `ThemeColors`:
 * el fondo salia `undefined` y la hoja no se atenuaba. La clave se ha
 * anadido al tema, asi que el velo ya es un token y no una constante local.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "flex-end",
    },

    container: {
      backgroundColor: colors.backgroundCard,
      padding: 24,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 0,
      maxHeight: "70%",
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
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

    branchItem: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.backgroundCard,
      borderWidth: 1,
      borderColor: colors.border,
    },

    branchName: {
      ...text.bodyMedium,
      fontSize: 16,
      color: colors.textHeading,
      fontWeight: "600",
    },

    branchAddress: {
      ...text.caption,
      marginTop: 4,
      color: colors.secondaryText,
    },

    branchSelected: {
      backgroundColor: colors.primarySurface,
      borderColor: colors.primary,
    },

    closeButton: {
      marginTop: 20,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: colors.input,
      borderWidth: 0,
    },

    closeText: {
      ...text.label,
      fontSize: 15,
      color: colors.button,
    },
  });
};
