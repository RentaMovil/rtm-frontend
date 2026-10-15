import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { usePasswordCodeFlow } from "../hooks/usePasswordCodeFlow";
import { createAuthStyles } from "../pages/authStyles";

type Props = {
  /** Correo de la sesion; si viene, no se pide el correo. */
  fixedEmail?: string;
  /** Se llama cuando la contrasena ya se cambio. */
  onDone: () => Promise<void> | void;
};

/**
 * Pasos de cambiar la contrasena con un codigo enviado al correo. Se usa en
 * "olvide mi contrasena" (login) y en cambiar contrasena con sesion iniciada.
 */
export default function PasswordCodeFlow({ fixedEmail, onDone }: Props) {
  const { t } = useTranslation();

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createAuthStyles(colors);

  const flow = usePasswordCodeFlow({ fixedEmail, t, onDone });

  const spinner = <ActivityIndicator color={colors.buttonText} />;

  return (
    <View style={styles.form}>
      {flow.error ? <Text style={styles.error}>{flow.error}</Text> : null}
      {flow.info && !flow.error ? (
        <Text style={styles.info}>{flow.info}</Text>
      ) : null}

      {flow.step === "email" && (
        <>
          <Text style={styles.hint}>{t("passwordRecovery.emailIntro")}</Text>

          <View>
            <Text style={styles.label}>{t("passwordRecovery.emailLabel")}</Text>

            <TextInput
              placeholder={t("loginForm.emailPlaceholder")}
              placeholderTextColor={colors.secondaryText}
              value={flow.emailInput}
              onChangeText={flow.setEmailInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, styles.inputWeb]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (flow.loading || !flow.isEmailValid) && styles.buttonDisabled,
            ]}
            onPress={flow.sendCode}
            disabled={flow.loading || !flow.isEmailValid}
          >
            {flow.loading ? (
              spinner
            ) : (
              <Text style={styles.buttonText}>
                {t("passwordRecovery.sendCode")}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {flow.step === "send" && (
        <>
          <Text style={styles.hint}>
            {t("passwordRecovery.sendIntro", { email: flow.email })}
          </Text>

          <TouchableOpacity
            style={[styles.button, flow.loading && styles.buttonDisabled]}
            onPress={flow.sendCode}
            disabled={flow.loading}
          >
            {flow.loading ? (
              spinner
            ) : (
              <Text style={styles.buttonText}>
                {t("passwordRecovery.sendCode")}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {flow.step === "code" && (
        <>
          <View>
            <Text style={styles.label}>{t("passwordRecovery.codeLabel")}</Text>

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
                {t("passwordRecovery.verifyCode")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.linkButton,
              (flow.loading || flow.cooldown > 0) && styles.linkButtonDisabled,
            ]}
            onPress={flow.sendCode}
            disabled={flow.loading || flow.cooldown > 0}
          >
            <Text style={styles.linkButtonText}>
              {flow.cooldown > 0
                ? t("passwordRecovery.resendIn", { seconds: flow.cooldown })
                : t("passwordRecovery.resendCode")}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {flow.step === "password" && (
        <>
          <View>
            <Text style={styles.label}>
              {t("passwordRecovery.newPassword")}
            </Text>

            <View style={styles.passwordField}>
              <TextInput
                placeholder={t("loginForm.passwordPlaceholder")}
                placeholderTextColor={colors.secondaryText}
                secureTextEntry={!flow.showPassword}
                autoCapitalize="none"
                value={flow.password}
                onChangeText={flow.setPassword}
                style={[styles.input, styles.inputWeb, styles.inputPassword]}
              />

              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => flow.setShowPassword(!flow.showPassword)}
                accessibilityRole="button"
                accessibilityLabel={t(
                  flow.showPassword
                    ? "loginForm.hidePassword"
                    : "loginForm.showPassword",
                )}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <FontAwesome
                  name={flow.showPassword ? "eye-slash" : "eye"}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rules}>
            {flow.rules.map((rule) => (
              <Text
                key={rule.label}
                style={rule.valid ? styles.ruleValid : styles.ruleInvalid}
              >
                {rule.label}
              </Text>
            ))}
          </View>

          <View>
            <Text style={styles.label}>
              {t("passwordRecovery.confirmPassword")}
            </Text>

            <TextInput
              placeholder={t("loginForm.passwordPlaceholder")}
              placeholderTextColor={colors.secondaryText}
              secureTextEntry={!flow.showPassword}
              autoCapitalize="none"
              value={flow.confirmPassword}
              onChangeText={flow.setConfirmPassword}
              style={[
                styles.input,
                styles.inputWeb,
                flow.confirmPassword.length > 0 &&
                  !flow.passwordsMatch &&
                  styles.inputError,
              ]}
            />
          </View>

          {flow.confirmPassword.length > 0 && !flow.passwordsMatch ? (
            <Text style={styles.error}>
              {t("passwordRecovery.mismatch")}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              (flow.loading || !flow.isPasswordFormValid) &&
                styles.buttonDisabled,
            ]}
            onPress={flow.submitPassword}
            disabled={flow.loading || !flow.isPasswordFormValid}
          >
            {flow.loading ? (
              spinner
            ) : (
              <Text style={styles.buttonText}>
                {t("passwordRecovery.save")}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
