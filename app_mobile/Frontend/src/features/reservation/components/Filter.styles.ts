import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";

/**
 * Filtros de estado de las reservas.
 *
 * El web da a `.letra-filtro` `font-weight: 500`; aqui el chip activo usa
 * Inter 600 sobre el primario y el inactivo Inter 500.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 9,
    },

    button: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },

    activeButton: {
      backgroundColor: colors.button,
      borderColor: colors.button,
    },

    text: {
      ...text.caption,
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },

    activeText: {
      color: colors.buttonText,
      fontWeight: "600",
    },
  });
};
