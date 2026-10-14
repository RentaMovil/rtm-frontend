import { useState } from "react";
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
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import BrandLogo from "../../../shared/components/Brand/BrandLogo";

import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../../../shared/api/httpClient";
import { API_URL } from "../../../config/env";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import { Fonts } from "../../../theme/fonts";

import { createAuthStyles } from "./authStyles";

/**
 * Traduce el error de una excepcion a algo mostrable.
 *
 * Un fallo de red en React Native lanza un `TypeError` con el mensaje
 * "Network request failed", que no le dice nada a nadie. Lo mas probable
 * es que el mock server no este corriendo, asi que se dice explicitamente.
 */
function readableError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  const message = error instanceof Error ? error.message : "";

  if (message.includes("Network request failed")) {
    return `No se pudo conectar con la API en ${API_URL}. Verifica que este corriendo.`;
  }

  return message || "Ocurrio un error inesperado.";
}

export default function LoginPage() {
  const { t } = useTranslation();

  const { login } = useAuth();

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createAuthStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Tras entrar no se navega aqui: `isAuthenticated` cambia en
   * `AuthContext`, y el guard de `app/_layout.tsx` es quien lleva al menu.
   * Hacerlo aqui ademas competia con ese `replace` y podia quedar la ruta a
   * medias.
   */
  async function handleLogin() {
    if (isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      setError(t("loginForm.errorFields"));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(readableError(err));
      setIsSubmitting(false);
    }
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
        <BrandLogo size="auth" />

        <Text style={styles.title}>{t("loginForm.Title")}</Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>{t("loginForm.email")}</Text>

            <TextInput
              placeholder={t("loginForm.emailPlaceholder")}
              placeholderTextColor={colors.secondaryText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, styles.inputWeb]}
            />
          </View>

          <View>
            <Text style={styles.label}>{t("loginForm.password")}</Text>

            <View style={styles.passwordField}>
              <TextInput
                placeholder={t("loginForm.passwordPlaceholder")}
                placeholderTextColor={colors.secondaryText}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, styles.inputWeb, styles.inputPassword]}
              />

              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={t(
                  showPassword
                    ? "loginForm.hidePassword"
                    : "loginForm.showPassword"
                )}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <Text style={styles.buttonText}>{t("loginForm.submit")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t("loginForm.noAccount")}</Text>

            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={styles.switchLink}>{t("register.submit")}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
