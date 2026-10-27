import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles } from "./AppAlert.styles";

export type AppAlertButton = {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type AlertState = {
  title: string;
  message?: string;
  buttons: AppAlertButton[];
};

let showHandler: ((state: AlertState) => void) | null = null;

/**
 * Reemplazo de `Alert.alert` de React Native.
 *
 * `Alert.alert` dispara el dialogo nativo del sistema operativo (en Android
 * suele mostrar las claves de i18n sin estilo propio si algo falla, y nunca
 * respeta el tema claro/oscuro de la app). `appAlert.alert` tiene la misma
 * firma pero renderiza un modal propio, montado una sola vez en
 * `AppAlertHost` dentro del layout raiz.
 */
export const appAlert = {
  alert(title: string, message?: string, buttons?: AppAlertButton[]) {
    showHandler?.({
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: "OK" }],
    });
  },
};

export default function AppAlertHost() {
  const [state, setState] = useState<AlertState | null>(null);
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  useEffect(() => {
    showHandler = setState;
    return () => {
      showHandler = null;
    };
  }, []);

  function handlePress(button: AppAlertButton) {
    setState(null);
    button.onPress?.();
  }

  if (!state) {
    return null;
  }

  // Con 3 o mas botones se apilan en columna (p.ej. elegir camara/galeria/
  // cancelar): en fila no caben los textos mas largos en pantallas angostas.
  const stacked = state.buttons.length > 2;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => setState(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{state.title}</Text>

          {!!state.message && <Text style={styles.message}>{state.message}</Text>}

          <View style={stacked ? styles.buttonsColumn : styles.buttonsRow}>
            {state.buttons.map((button, index) => (
              <TouchableOpacity
                key={`${button.text ?? "ok"}-${index}`}
                style={[
                  styles.button,
                  stacked && styles.buttonFullWidth,
                  button.style === "cancel"
                    ? styles.cancelButton
                    : button.style === "destructive"
                      ? styles.destructiveButton
                      : styles.defaultButton,
                ]}
                onPress={() => handlePress(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.cancelButtonText,
                    button.style === "destructive" && styles.destructiveButtonText,
                  ]}
                >
                  {button.text ?? "OK"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
