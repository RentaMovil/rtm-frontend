import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { Spacing } from "../../../theme/constants/spacing";

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
      borderBottomWidth: 0,
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

    // Antes 18px, un valor fuera de la escala de `Spacing` que no coincidia
    // con el resto de tarjetas de este mismo flujo (p. ej. `card` en
    // `ReservationDetailPage.styles.ts` usa el mismo `Spacing.lg`).
    section: {
      marginBottom: Spacing.lg,
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
