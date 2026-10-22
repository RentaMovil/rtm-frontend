import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import ContinueButton from "../../../shared/components/Button/ContinueButton";
import AppCard from "../../../shared/components/AppCard/AppCard";

import { ApiError } from "../../../shared/api/httpClient";
import { useAuth } from "../../auth/context/AuthContext";
import PasswordCodeFlow from "../../auth/components/PasswordCodeFlow";
import {
  buildPasswordRules,
  isPasswordValid,
} from "../../auth/utils/passwordRules";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

type Method = "password" | "code";

/**
 * Cambio de contrasena con sesion iniciada. Hay dos metodos:
 *  - "password": con la contrasena actual (`PATCH /users/me/password`).
 *  - "code": con un codigo enviado al correo de la cuenta (mismos endpoints
 *    de recuperar contrasena: forgot, verify-code y reset).
 *
 * En ambos casos iam cierra todas las sesiones al cambiarla, asi que despues
 * se cierra la sesion local y el guard de `app/_layout.tsx` lleva al login.
 */
export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const { changePassword, logout, user } = useAuth();
  const router = useRouter();

  const [method, setMethod] = useState<Method>("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  const rules = buildPasswordRules(newPassword, t);

  function selectMethod(next: Method) {
    setMethod(next);
    setError(null);
  }

  async function finish() {
    Alert.alert(t("changePassword.title"), t("changePassword.successRelogin"));

    await logout();
  }

  function validate(): string | null {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return t("loginForm.errorFields");
    }

    if (newPassword !== confirmPassword) {
      return t("changePassword.invalid");
    }

    if (!isPasswordValid(newPassword)) {
      return t("changePassword.errorPassword");
    }

    if (newPassword === currentPassword) {
      return t("changePassword.samePassword");
    }

    return null;
  }

  async function handleSubmit() {
    const problem = validate();

    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      await finish();
    } catch (err) {
      // El server responde 401 si la contrasena actual es incorrecta.
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : t("changePassword.errorRequest"),
      );
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t("changePassword.title")}</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, method === "password" && styles.tabActive]}
          onPress={() => selectMethod("password")}
          accessibilityRole="tab"
          accessibilityState={{ selected: method === "password" }}
        >
          <Text
            style={[
              styles.tabText,
              method === "password" && styles.tabTextActive,
            ]}
          >
            {t("changePassword.methodPassword")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, method === "code" && styles.tabActive]}
          onPress={() => selectMethod("code")}
          accessibilityRole="tab"
          accessibilityState={{ selected: method === "code" }}
        >
          <Text
            style={[styles.tabText, method === "code" && styles.tabTextActive]}
          >
            {t("changePassword.methodCode")}
          </Text>
        </TouchableOpacity>
      </View>

      <AppCard>
        {method === "password" ? (
          <>
            <Text style={styles.label}>{t("changePassword.currentPassword")}</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder={t("loginForm.passwordPlaceholder")}
              placeholderTextColor={colors.secondaryText}
            />

            <Text style={styles.label}>{t("changePassword.newPassword")}</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder={t("loginForm.passwordPlaceholder")}
              placeholderTextColor={colors.secondaryText}
            />

            <View style={styles.rules}>
              {rules.map((rule) => (
                <Text
                  key={rule.label}
                  style={rule.valid ? styles.ruleValid : styles.ruleInvalid}
                >
                  {rule.label}
                </Text>
              ))}
            </View>

            <Text style={styles.label}>{t("changePassword.confirmPassword")}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder={t("loginForm.passwordPlaceholder")}
              placeholderTextColor={colors.secondaryText}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <ContinueButton
                  title={t("changePassword.save")}
                  onPress={handleSubmit}
                />
              )}
            </View>
          </>
        ) : (
          <PasswordCodeFlow fixedEmail={user?.email} onDone={finish} />
        )}
      </AppCard>

      <TouchableOpacity
        style={styles.cancel}
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.cancelText}>{t("changePassword.cancel")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 20,
    },

    title: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 16,
    },

    tabs: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },

    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    tabText: {
      fontSize: 12,
      lineHeight: 15,
      fontWeight: "700",
      color: colors.secondaryText,
      textAlign: "center",
    },

    tabTextActive: {
      color: colors.buttonText,
    },

    label: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.secondaryText,
      marginBottom: 7,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      marginBottom: 16,
    },

    rules: {
      gap: 2,
      marginBottom: 16,
    },

    ruleValid: {
      fontSize: 12,
      color: colors.success,
    },

    ruleInvalid: {
      fontSize: 12,
      color: colors.error,
    },

    error: {
      color: colors.error,
      fontSize: 14,
      marginBottom: 12,
    },

    actions: {
      gap: 12,
    },

    cancel: {
      alignItems: "center",
      paddingVertical: 16,
    },

    cancelText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.secondaryText,
    },
  });
