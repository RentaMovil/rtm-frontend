import { ViewStyle } from "react-native";

/**
 * Sombra de tarjeta.
 *
 * El web la define por tema como `--shadow`, con dos capas en los temas
 * oscuros. En movil se aproxima con las propiedades de iOS y Android.
 *
 * Antes usaba `colors.shadow`, clave que no existia en `ThemeColors` y por
 * tanto llegaba como `undefined`. Ahora `shadow` es parte del tema.
 */
export const createCardShadow = (colors: any): ViewStyle => ({
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
});

/** Sombra discreta, para superficies internas (filas, campos). */
export const createSoftShadow = (colors: any): ViewStyle => ({
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
});
