import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { Radius } from "../../../theme/constants/radius";
import { Spacing } from "../../../theme/constants/spacing";

/**
 * Selector de seguro.
 *
 * Copia de `web/Front-end/src/features/booking/components/InsureanceSelector.css`:
 * cabecera con escudo, opciones en rejilla de tres columnas
 * (informacion | precio | radio) y la barra de acento de 3px a la izquierda
 * de la opcion elegida.
 *
 * El CSS del web usa `--insurance-accent` y `--accent-strong`, que **no estan
 * definidos en ningun sitio** del proyecto web: esos `color-mix()` no
 * resuelven. Aqui se sustituyen por los tokens que si existen en el tema
 * (`button`, `accentBg`, `accentBorder`), que es el mismo papel.
 */
export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    /* --- Cabecera --- */

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.md,
      marginBottom: 20,
    },

    // `.insurance-header-icon`: cuadrado 38px con tinte de acento.
    headerIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accentBg,
    },

    headerText: {
      flex: 1,
    },

    title: {
      ...text.h3,
      marginTop: 1,
      color: colors.textHeading,
    },

    subtitle: {
      ...text.caption,
      marginTop: 5,
      color: colors.text,
    },

    /* --- Opciones --- */

    options: {
      gap: Spacing.md,
    },

    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      minHeight: 68,
      paddingVertical: Spacing.lg,
      paddingLeft: 18,
      paddingRight: Spacing.lg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.cardBg,
    },

    // `.insurance-option-selected`: tinte de acento, borde de acento y la
    // barra `inset 3px 0 0` del web, que aqui es un borde izquierdo.
    optionSelected: {
      borderColor: colors.button,
      backgroundColor: colors.accentBg,
      borderLeftWidth: 3,
      borderLeftColor: colors.button,
      paddingLeft: 16,
    },

    optionInfo: {
      flex: 1,
    },

    name: {
      ...text.bodyMedium,
      fontSize: 16,
      lineHeight: 21,
      color: colors.text,
    },

    // La descripcion es larga: en el web es 14px/1.5, y se mantiene.
    description: {
      ...text.caption,
      marginTop: 3,
      lineHeight: 20,
      color: colors.text,
      opacity: 0.85,
    },

    // `.insurance-price`: pastilla con el precio.
    price: {
      minWidth: 78,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
      alignItems: "center",
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },

    priceText: {
      ...text.label,
      fontSize: 14,
      color: colors.primaryDark,
    },

    // Etiqueta del catalogo (base / popular / premium). El web no la pinta en
    // el selector de booking, pero el dato existe y distingue los planes.
    tag: {
      alignSelf: "flex-start",
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.pill,
      backgroundColor: colors.input,
    },

    tagText: {
      ...text.overline,
      fontSize: 10,
    },

    // `.insurance-radio`: circulo 22px con el acento de fondo al elegir.
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundCard,
    },

    radioSelected: {
      borderColor: colors.button,
      backgroundColor: colors.button,
    },
  });
};
