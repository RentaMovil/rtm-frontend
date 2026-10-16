import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import BrandLogo from "../../../shared/components/Brand/BrandLogo";

import { useEmailVerificationFlow } from "../hooks/useEmailVerificationFlow";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createAuthStyles } from "./authStyles";

/**
 * Confirmar el codigo enviado al correo al registrarse (HU-IAM-001).
 *
 * Llega aqui desde dos lados: el registro (siempre, la cuenta nunca queda
 * logueada sola) y el login, si el backend responde 403 EMAIL_NOT_VERIFIED
 * (la cuenta ya existe pero nunca se confirmo). En los dos casos el email ya
 * se conoce, se pasa como parametro de la ruta.
 */
export default function EmailVerificationPage() {
  const { t } = useTranslation();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const email = (emailParam ?? "").trim().toLowerCase();

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createAuthStyles(colors);

  const flow = useEmailVerificationFlow({ email, t });

  const spinner = <ActivityIndicator color={colors.buttonText} />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <BrandLogo size="auth" />

        <Text style={styles.title}>{t("emailVerification.title")}</Text>

        <View style={styles.form}>
          <Text style={styles.hint}>
            {t("emailVerification.intro", { email })}
          </Text>

          {flow.error ? <Text style={styles.error}>{flow.error}</Text> : null}
          {flow.info && !flow.error ? (
            <Text style={styles.info}>{flow.info}</Text>
          ) : null}

          <View>
            <Text style={styles.label}>{t("emailVerification.codeLabel")}</Text>

            <TextInput
              placeholder="••••••"
              placeholderTextColor={colors.secondaryText}
              value={flow.code}
              onChangeText={flow.setCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={6}
              style={[styles.input, styles.inputWeb, styles.codeInput]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (flow.loading || !flow.isCodeComplete) && styles.buttonDisabled,
            ]}
            onPress={flow.submitCode}
            disabled={flow.loading || !flow.isCodeComplete}
          >
            {flow.loading ? (
              spinner
            ) : (
              <Text style={styles.buttonText}>
                {t("emailVerification.verifyCode")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.linkButton,
              (flow.loading || flow.cooldown > 0) && styles.linkButtonDisabled,
            ]}
            onPress={flow.resend}
            disabled={flow.loading || flow.cooldown > 0}
          >
            <Text style={styles.linkButtonText}>
              {flow.cooldown > 0
                ? t("emailVerification.resendIn", { seconds: flow.cooldown })
                : t("emailVerification.resendCode")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
