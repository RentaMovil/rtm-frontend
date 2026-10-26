import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import BrandLogo from "../../../shared/components/Brand/BrandLogo";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import PasswordCodeFlow from "../components/PasswordCodeFlow";
import { createAuthStyles } from "./authStyles";

/**
 * "Olvide mi contrasena": correo -> codigo -> contrasena nueva. Al terminar
 * se vuelve al login (aqui no hay sesion que cerrar).
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { themeName } = useTheme();
  const styles = createAuthStyles(themes[themeName]);

  function handleDone() {
    Alert.alert(t("passwordRecovery.title"), t("passwordRecovery.success"));
    router.replace("/auth/login");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <BrandLogo size="auth" showIcon={false} />

        <Text style={styles.title}>{t("passwordRecovery.title")}</Text>

        <PasswordCodeFlow onDone={handleDone} />

        <View style={styles.switchRow}>
          <TouchableOpacity onPress={() => router.replace("/auth/login")}>
            <Text style={styles.switchLink}>
              {t("passwordRecovery.backToLogin")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
