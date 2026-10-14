import { StyleSheet } from "react-native";

import { createTextStyles } from "../../../theme/constants/typography";
import { createSoftShadow } from "../../../theme/constants/shadows";
import { Radius } from "../../../theme/constants/radius";
import { Spacing } from "../../../theme/constants/spacing";

/**
 * Estilos de las pantallas de autenticacion (login y registro).
 *
 * Antes vivian en el propio `.tsx` con colores hex sueltos (`#F1EFE8`,
 * `#1A2E4A`, `#D9D9D9`, `#B3261E`) y ninguna `fontFamily`, asi que la
 * pantalla de login era la unica que no respondia al tema ni a las fuentes
 * cargadas. Ahora todo sale de tokens.
 */
export const createAuthStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xxl,
    },

    /**
     * El logotipo ya no se pinta aqui: lo aporta `BrandLogo` de `shared`, que
     * es el mismo que usan el header de las tabs y el del Stack. Antes cada
     * pantalla tenia su copia y los colores no coincidian.
     */

    title: {
      ...text.h1,
      marginBottom: Spacing.xl,
      color: colors.textHeading,
    },

    form: {
      gap: Spacing.lg,
    },

    /** Dos campos en linea, para nombre/apellido y contrasena/confirmacion. */
    row: {
      flexDirection: "row",
      gap: Spacing.md,
    },

    rowItem: {
      flex: 1,
    },

    label: {
      ...text.label,
      marginBottom: 6,
      color: colors.text,
    },

    input: {
      ...text.body,
      height: 52,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
      fontSize: 15,
      color: colors.text,
    },

    /** El navegador pinta su propio fondo en el input, hay que forzar el transparente. */
    inputWeb: {
      backgroundColor: "transparent",
    },

    /**
     * Campo de contrasena con el boton de mostrar/ocultar superpuesto a la
     * derecha (`passwordField` + `togglePassword`). El input reserva espacio
     * con `inputPassword` para que el texto no quede debajo del boton.
     */
    passwordField: {
      position: "relative",
      justifyContent: "center",
    },

    inputPassword: {
      paddingRight: 52,
    },

    togglePassword: {
      position: "absolute",
      right: 4,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },

    inputError: {
      borderColor: colors.error,
    },

    error: {
      ...text.caption,
      color: colors.error,
    },

    button: {
      height: 54,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginTop: Spacing.sm,
      backgroundColor: colors.primary,
      ...createSoftShadow(colors),
    },

    buttonDisabled: {
      opacity: 0.6,
    },

    buttonText: {
      ...text.label,
      fontSize: 16,
      color: colors.buttonText,
    },

    /** Enlace para ir a la pantalla gemela (registro / login). */
    switchRow: {
      marginTop: Spacing.xl,
      alignItems: "center",
    },

    switchText: {
      ...text.caption,
    },

    switchLink: {
      ...text.label,
      marginTop: 4,
      color: colors.primary,
    },
  });
};
