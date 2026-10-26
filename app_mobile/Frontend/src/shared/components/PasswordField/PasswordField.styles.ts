import { StyleSheet } from "react-native";

/**
 * Campo de contrasena con el boton de mostrar/ocultar superpuesto a la
 * derecha.
 *
 * Antes cada pantalla tenia su copia del mismo bloque (input + ojo), que es
 * lo que marcaba Sonar como duplicacion en el PR. Los estilos de aqui son
 * exactamente los que se repetian en `authStyles` y en `ChangePasswordPage`;
 * la caja del input la aporta cada pagina via `inputStyle`.
 */
export const createStyles = () =>
  StyleSheet.create({
    /** Relativo para que el boton del ojo se superponga al input. */
    field: {
      position: "relative",
      justifyContent: "center",
    },

    /** Reserva espacio a la derecha para que el texto no quede bajo el ojo. */
    input: {
      paddingRight: 52,
    },

    toggle: {
      position: "absolute",
      right: 4,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
  });
