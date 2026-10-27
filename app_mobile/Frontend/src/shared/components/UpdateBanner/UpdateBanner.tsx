import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../../theme/useTheme";
import { themes } from "../../../theme/themes";
import { useOtaUpdate } from "../../hooks/useOtaUpdate";

import { createStyles } from "./UpdateBanner.styles";

/** Aviso flotante cuando hay una actualizacion OTA (eas update) descargada
 * y lista: el usuario decide cuando reiniciar, no se le fuerza de golpe. */
export default function UpdateBanner() {
  const { t } = useTranslation();
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  const { isUpdateReady, isApplying, applyUpdate } = useOtaUpdate();

  if (!isUpdateReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.text}>{t("otaUpdate.available")}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={applyUpdate}
          disabled={isApplying}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color={colors.buttonText} />
          ) : (
            <Text style={styles.buttonText}>{t("otaUpdate.updateNow")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
