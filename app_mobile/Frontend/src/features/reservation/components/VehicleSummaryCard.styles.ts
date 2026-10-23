import { StyleSheet } from "react-native";

import { VEHICLE_IMAGE_ASPECT_RATIO } from "../../../config/assets";
import { Radius } from "../../../theme/constants/radius";
import { Spacing } from "../../../theme/constants/spacing";
import { createTextStyles } from "../../../theme/constants/typography";

/**
 * Resumen del vehiculo en la reserva.
 *
 * El fondo de los badges usaba `colors.cardSecondary`, clave que tampoco
 * existe en `ThemeColors`, asi que salia `undefined`. Ahora usa `input`, que
 * si existe y cumple el mismo papel de superficie sutil.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    image: {
      width: "100%",
      // Antes: `height: 200` fijo con `resizeMode: "cover"`. La imagen real
      // es ~2.09:1, asi que esa caja recortaba los lados del auto. Con
      // `aspectRatio` el alto se ajusta a la proporcion real de la imagen.
      aspectRatio: VEHICLE_IMAGE_ASPECT_RATIO,
      borderRadius: Radius.card,
      resizeMode: "contain",
      backgroundColor: colors.input,
      marginBottom: Spacing.lg,
    },

    content: {
      gap: Spacing.xs,
    },

    // El nombre del vehiculo es el titulo de la pantalla: familia Poppins.
    name: {
      ...text.h2,
      color: colors.textHeading,
    },

    model: {
      ...text.body,
      color: colors.secondaryText,
    },

    infoContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },

    badge: {
      backgroundColor: colors.input,
      borderRadius: Radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    badgeText: {
      ...text.label,
      color: colors.text,
    },

    badgeIcon: {
      marginRight: 6,
    },

    price: {
      ...text.h1,
      marginTop: Spacing.lg,
      color: colors.primary,
    },
  });
};
