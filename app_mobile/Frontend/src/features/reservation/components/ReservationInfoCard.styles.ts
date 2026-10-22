import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";

/**
 * Datos de la reserva (recogida y devolucion).
 *
 * Cabecera con el punto de acento y la regla inferior que usa el web en
 * `.pay-card-header`.
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

    section: {
      marginBottom: 18,
    },

    // Etiqueta pequena en versal, el patron `.overline` del web.
    label: {
      ...text.overline,
      marginBottom: 4,
    },

    value: {
      ...text.bodyMedium,
      color: colors.textHeading,
    },

    link: {
      ...text.bodyMedium,
      marginTop: 6,
      color: colors.button,
    },
  });
};
