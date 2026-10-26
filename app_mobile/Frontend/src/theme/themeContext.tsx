import React, { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Themes, themes } from "./themes";

export type ThemeContextType = {
  themeName: Themes;
  setTheme: (theme: Themes) => void;
};

export const ThemeContext =
  createContext<ThemeContextType>(
    {} as ThemeContextType
  );

/** Clave de persistencia de la preferencia de tema. */
const THEME_KEY = "@rentamovil/theme";

/**
 * Proveedor del tema.
 *
 * Antes el tema empezaba siempre en "light" y se perdia al cerrar la app.
 * Ahora:
 *
 *  - `savedTheme` es la ultima eleccion explicita del usuario, leida de
 *    AsyncStorage (mismo patron de tolerancia a fallos que `tokenStore`: si
 *    el almacenamiento no esta disponible, la app sigue funcionando sin
 *    persistencia).
 *  - Sin eleccion guardada se sigue el esquema del sistema via
 *    `useColorScheme()`, que es lo que pide `userInterfaceStyle:
 *    "automatic"` de `app.json`. Al ser un valor derivado (y no un
 *    `useState` inicial), un cambio del sistema en caliente tambien se
 *    respeta mientras el usuario no haya elegido un tema a mano.
 */
export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const systemScheme = useColorScheme();

  const [savedTheme, setSavedTheme] =
    useState<Themes | null>(null);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (cancelled || !saved) return;
        if (saved in themes) {
          setSavedTheme(saved as Themes);
        }
      })
      .catch(() => {
        // Sin AsyncStorage disponible no hay nada que persistir: se queda
        // con el tema derivado del sistema.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const themeName: Themes =
    savedTheme ?? (systemScheme === "dark" ? "dark" : "light");

  const setTheme = (theme: Themes) => {
    setSavedTheme(theme);
    AsyncStorage.setItem(THEME_KEY, theme).catch(() => {});
  };

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
