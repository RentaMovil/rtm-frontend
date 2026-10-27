import { StyleSheet } from "react-native";

import { Fonts } from "../../../theme/fonts";
import { Radius } from "../../../theme/constants/radius";

/**
 * Logotipo de la app.
 *
 * `styles` es estatico a proposito: no depende del tema, asi que se declara
 * una sola vez a nivel de modulo. Los colores se aplican en el JSX con
 * `colors.x`, como en el resto de la app.
 */
export const createStyles = () =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    text: {
      fontFamily: Fonts.heading.bold,
      fontSize: 19,
      fontWeight: "700",
      // El web usa `letter-spacing: -.5px` sobre 1.7rem
      // (`.logo-text` de `Navbar.css`).
      letterSpacing: -0.5,
    },
  });

/** Variante de pantalla de acceso, con el icono y el texto mas grandes. */
export const createAuthStyles = () =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 32,
    },

    text: {
      fontFamily: Fonts.heading.bold,
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: -0.6,
    },
  });

export const radius = Radius;
