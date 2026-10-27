import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { createCardShadow } from "../../../theme/constants/shadows";
import { Radius } from "../../../theme/constants/radius";
import { Spacing } from "../../../theme/constants/spacing";

/**
 * Carrusel de pasos del proceso.
 *
 * El web lo pinta como una rejilla de 4 tarjetas
 * (`.steps-grid` en `CardsInfo.style.css`). En movil se hace carrusel
 * deslizante, con `pagingEnabled` para que el salto sea de una tarjeta
 * entera, que es lo que espera el dedo.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    container: {
      marginBottom: Spacing.xl,
    },

    title: {
      ...text.h2,
      fontSize: 22,
      color: colors.textHeading,
    },

    subtitle: {
      ...text.caption,
      marginTop: Spacing.xs,
      marginBottom: Spacing.lg,
      color: colors.secondaryText,
    },

    // `pagingEnabled` hace que cada slide ocupe el ancho completo, asi que el
    // padding va en el item, no en el carrusel: si no, el salto seria menor
    // que la pantalla y el "paging" descuadraria.
    slider: {
      marginHorizontal: -Spacing.lg,
    },

    slide: {
      paddingHorizontal: Spacing.lg,
    },

    card: {
      padding: Spacing.xl,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
      minHeight: 210,
      ...createCardShadow(colors),
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },

    // Numero del paso, en circulo. Sustituye a Fa1/Fa2/Fa3/Fa4 del web.
    stepBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },

    stepNumber: {
      ...text.h3,
      fontSize: 18,
      fontWeight: "800",
      color: colors.buttonText,
    },

    stepTitle: {
      ...text.title,
      flex: 1,
      color: colors.textHeading,
    },

    stepIcon: {
      marginTop: Spacing.lg,
    },

    stepDescription: {
      ...text.body,
      marginTop: Spacing.md,
      color: colors.text,
      opacity: 0.85,
    },

    /* --- Puntos de progreso --- */

    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginTop: Spacing.lg,
    },

    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.borderfilter,
    },

    dotActive: {
      width: 22,
      backgroundColor: colors.primary,
    },
  });
};
