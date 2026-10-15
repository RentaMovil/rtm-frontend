import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { createCardShadow } from "../../../theme/constants/shadows";

/**
 * Selector de cuenta bancaria.
 *
 * Segun `BankAccountSelector.css` del web: tarjeta con borde de 2px y
 * sombra, radio marcado con el acento, numero de cuenta en tipografia
 * monoespaciada y el titular en una caja `--input`.
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

    accountsContainer: {
      gap: 16,
    },

    accountCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.cardBorder,
      backgroundColor: colors.cardBg,
      ...createCardShadow(colors),
    },

    // El web marca la seleccion con `border-color: var(--accent)` y un halo
    // `box-shadow: 0 0 0 1px var(--accent)`.
    selectedAccount: {
      borderColor: colors.button,
    },

    accountInfo: {
      flex: 1,
    },

    accountTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },

    // `.bank-account-logo`: cuadrado con tinte de acento.
    logo: {
      width: 42,
      height: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accentBg,
    },

    logoText: {
      ...text.label,
      color: colors.primaryDark,
    },

    radioWrapper: {
      flex: 1,
    },

    bankName: {
      ...text.bodyMedium,
      fontSize: 16,
      color: colors.textHeading,
    },

    // `.bank-account-holder`: caja con fondo `--input`.
    holder: {
      ...text.caption,
      fontSize: 13,
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.input,
      color: colors.text,
      lineHeight: 18,
    },

    qrBox: {
      alignItems: "center",
      marginTop: 4,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.backgroundCard,
    },

    qrImage: {
      width: 160,
      height: 160,
    },

    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },

    radioSelected: {
      borderColor: colors.button,
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.button,
    },
  });
};
