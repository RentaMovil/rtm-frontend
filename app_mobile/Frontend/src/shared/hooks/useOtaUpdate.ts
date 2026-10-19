import { useEffect, useState } from "react";
import { AppState } from "react-native";
import * as Updates from "expo-updates";

/**
 * Revisa si hay una actualizacion OTA (eas update) lista para instalar.
 *
 * `Updates.isEnabled` es `false` en Expo Go y en el development client: ahi
 * no hay nada que revisar, así que el hook no hace nada (evita el warning de
 * expo-updates sobre correr fuera de un build real).
 *
 * Revisa al abrir la app y cada vez que vuelve a primer plano, no en un
 * intervalo fijo: no tiene sentido pollear mientras el usuario no esta
 * mirando la app.
 */
export function useOtaUpdate() {
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  async function checkForUpdate() {
    if (!Updates.isEnabled || isUpdateReady) {
      return;
    }

    try {
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) {
        return;
      }

      await Updates.fetchUpdateAsync();
      setIsUpdateReady(true);
    } catch {
      // Sin internet o el servidor de updates no respondio: no es un error
      // que el usuario necesite ver, simplemente no hay nada nuevo todavia.
    }
  }

  useEffect(() => {
    checkForUpdate();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, []);

  async function applyUpdate() {
    setIsApplying(true);
    try {
      await Updates.reloadAsync();
    } catch {
      setIsApplying(false);
    }
  }

  return { isUpdateReady, isApplying, applyUpdate };
}
