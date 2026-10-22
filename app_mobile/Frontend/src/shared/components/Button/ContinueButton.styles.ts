import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { createSoftShadow } from "../../../theme/constants/shadows";
import { Radius } from "../../../theme/constants/radius";

/**
 * Boton de accion principal.
 *
 * El web da a los botones `font-family: var(--sans)` con `font-weight: 600`.
 * Aqui se usa Inter 600 y radio 12, con sombra suave para despegarlo del
 * fondo en los temas oscuros.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    button: {
      backgroundColor: colors.button,
      paddingVertical: 16,
      borderRadius: Radius.md,
      alignItems: "center",
      marginVertical: 10,
      ...createSoftShadow(colors),
    },

    disabled: {
      backgroundColor: colors.border,
      opacity: 0.6,
    },

    text: {
      ...text.label,
      fontSize: 16,
      color: colors.buttonText,
    },
  });
};
