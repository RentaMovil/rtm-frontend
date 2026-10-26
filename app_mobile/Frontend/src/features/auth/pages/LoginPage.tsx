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
import { Link, useRouter } from "expo-router";

import BrandLogo from "../../../shared/components/Brand/BrandLogo";
import PasswordField from "../../../shared/components/PasswordField/PasswordField";

import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../../../shared/api/httpClient";
import { API_URL } from "../../../config/env";
import i18n from "../../../translation/i18n";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

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
    return i18n.t("errors.network", { url: API_URL });
  }

  return message || i18n.t("errors.unexpected");
}

export default function LoginPage() {
  const { t } = useTranslation();

  const { login } = useAuth();
  const router = useRouter();

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createAuthStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos tocados (al menos un onBlur): hasta entonces no se muestra el
  // error individual, igual que en RegisterPage.
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  function markTouched(field: "email" | "password") {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  /**
   * Validacion en tiempo real, mismo patron que RegisterPage: el error
   * aparece tras el primer onBlur del campo y se recalcula en cada tecla
   * hasta quedar valido. La contrasena solo se exige no vacia: el resto
   * (credenciales) lo decide el server al intentar entrar.
   */
  function errorFor(field: "email" | "password"): string | null {
    const value = field === "email" ? email : password;

    if (!value.trim()) {
      return t("common.required");
    }

    if (field === "email" && !/^\S+@\S+\.\S+$/.test(value.trim())) {
      return t("loginForm.emailInvalid");
    }

    return null;
  }

  /**
   * Tras entrar no se navega aqui: `isAuthenticated` cambia en
   * `AuthContext`, y el guard de `app/_layout.tsx` lleva a Inicio.
   * Hacerlo aqui ademas competia con ese `replace` y podia quedar la ruta a
   * medias.
   */
  async function handleLogin() {
    if (isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      setError(t("loginForm.errorFields"));
      // Ademas del resumen, cada campo muestra su propio error.
      setTouched({ email: true, password: true });
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      // La cuenta existe y la contrasena es correcta, solo falta confirmar
      // el correo (HU-IAM-001): se manda directo a esa pantalla en vez de
      // mostrar un error generico.
      if (
        err instanceof ApiError &&
        (err.body as { error?: string } | null)?.error === "EMAIL_NOT_VERIFIED"
      ) {
        router.push({
          pathname: "/auth/verify-email",
          params: { email: email.trim().toLowerCase() },
        });
        return;
      }

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
        <BrandLogo size="auth" showIcon={false} />

        <Text style={styles.title}>{t("loginForm.Title")}</Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>{t("loginForm.email")}</Text>

            <TextInput
              placeholder={t("loginForm.emailPlaceholder")}
              placeholderTextColor={colors.secondaryText}
              value={email}
              onChangeText={setEmail}
              onBlur={() => markTouched("email")}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, styles.inputWeb]}
            />

            {touched.email && errorFor("email") ? (
              <Text style={styles.fieldError}>{errorFor("email")}</Text>
            ) : null}
          </View>

          <View>
            <Text style={styles.label}>{t("loginForm.password")}</Text>

            <PasswordField
              value={password}
              onChange={setPassword}
              onBlur={() => markTouched("password")}
              hidden={!showPassword}
              onToggleVisibility={() => setShowPassword((prev) => !prev)}
              inputStyle={[styles.input, styles.inputWeb]}
            />

            {touched.password && errorFor("password") ? (
              <Text style={styles.fieldError}>{errorFor("password")}</Text>
            ) : null}
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

          <Link href="/auth/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.switchLink}>
                {t("loginForm.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </Link>

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
