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
import FontAwesome from "@expo/vector-icons/FontAwesome";

import BrandLogo from "../../../shared/components/Brand/BrandLogo";

import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../../../shared/api/httpClient";
import { API_URL } from "../../../config/env";
import i18n from "../../../translation/i18n";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createAuthStyles } from "./authStyles";

/** Misma traduccion de error que el login. */
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

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const EMPTY: Fields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  confirmPassword: "",
};

/**
 * Alta de cuenta.
 *
 * El contrato ya existia: `authService.register()` y el tipo
 * `RegisterRequest` estaban escritos, y el namespace `register` de i18n
 * traia los 7 campos y todos los mensajes de validacion. Lo que faltaba era
 * la pantalla.
 *
 * El payload usa `first_name` / `last_name` en snake_case porque
 * `users` es la unica coleccion de la API en ese formato.
 */
export default function RegisterPage() {
  const { t } = useTranslation();

  const { register } = useAuth();
  const router = useRouter();

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createAuthStyles(colors);

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Campos tocados (al menos un onBlur): hasta entonces no se muestra el
  // error individual, para no marcar el formulario en rojo al abrirlo.
  const [touched, setTouched] = useState<Record<keyof Fields, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  function markTouched(name: keyof Fields) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  /**
   * Error de un campo concreto, para la validacion en tiempo real.
   *
   * Misma regla que `validate()` (el resumen que se manda al enviar), pero
   * evaluada campo a campo y en cada render: una vez tocado el campo, el
   * mensaje aparece y desaparece solo cuando el valor pasa a ser valido.
   */
  function errorFor(name: keyof Fields): string | null {
    const value = fields[name];

    switch (name) {
      case "email":
        if (!value.trim()) return t("register.required");
        return /^\S+@\S+\.\S+$/.test(value.trim())
          ? null
          : t("register.emailInvalid");
      case "phone":
        if (!value.trim()) return t("register.required");
        return /^\d{10}$/.test(value.trim())
          ? null
          : t("register.phoneInvalid");
      case "password":
        if (!value) return t("register.required");
        return value.length >= 6 ? null : t("register.passwordShort");
      case "confirmPassword":
        if (!value) return t("register.required");
        return value === fields.password ? null : t("register.passwordMatch");
      default:
        return value.trim() ? null : t("register.required");
    }
  }

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    const empty = [
      fields.firstName,
      fields.lastName,
      fields.email,
      fields.phone,
      fields.username,
      fields.password,
    ].some((v) => !v.trim());

    if (empty) {
      return t("register.errorFields");
    }

    if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) {
      return t("register.emailInvalid");
    }

    if (!/^\d{10}$/.test(fields.phone.trim())) {
      return t("register.phoneInvalid");
    }

    if (fields.password.length < 6) {
      return t("register.passwordShort");
    }

    if (fields.password !== fields.confirmPassword) {
      return t("register.passwordMatch");
    }

    return null;
  }

  /**
   * La cuenta queda PENDING_VERIFICATION (HU-IAM-001): `register` ya no deja
   * logueado, hay que confirmar el codigo que llega al correo primero.
   */
  async function handleRegister() {
    if (isSubmitting) {
      return;
    }

    const invalid = validate();

    if (invalid) {
      setError(invalid);
      // Ademas del resumen, se marca todos los campos para que cada uno
      // muestre su propio error bajo la caja.
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        username: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { email } = await register({
        first_name: fields.firstName,
        last_name: fields.lastName,
        email: fields.email,
        phone: fields.phone,
        username: fields.username,
        password: fields.password,
      });

      router.push({ pathname: "/auth/verify-email", params: { email } });
    } catch (err) {
      setError(readableError(err));
      setIsSubmitting(false);
    }
  }

  const field = (
    name: keyof Fields,
    placeholderKey: string,
    value: string,
    onChange: (v: string) => void,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: "default" | "email-address" | "phone-pad";
      autoCapitalize?: "none" | "words" | "sentences";
    },
  ) => {
    // En tiempo real: el error solo aparece tras el primer onBlur del campo
    // (o si se intento enviar); a partir de ahi se recalcula en cada tecla.
    const liveError = touched[name] ? errorFor(name) : null;

    return (
      <View>
        <Text style={styles.label}>{t(`register.${name}`)}</Text>

        {options?.secureTextEntry ? (
          // Mismo ojo de mostrar/ocultar que LoginPage y PasswordCodeFlow:
          // un unico toggle compartido por password y confirmPassword.
          <View style={styles.passwordField}>
            <TextInput
              placeholder={t(placeholderKey)}
              placeholderTextColor={colors.secondaryText}
              value={value}
              onChangeText={onChange}
              onBlur={() => markTouched(name)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
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
                color={colors.button}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            placeholder={t(placeholderKey)}
            placeholderTextColor={colors.secondaryText}
            value={value}
            onChangeText={onChange}
            onBlur={() => markTouched(name)}
            keyboardType={options?.keyboardType ?? "default"}
            autoCapitalize={options?.autoCapitalize ?? "words"}
            autoCorrect={false}
            style={[styles.input, styles.inputWeb]}
          />
        )}

        {liveError ? (
          <Text style={styles.fieldError}>{liveError}</Text>
        ) : null}
      </View>
    );
  };

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

        <Text style={styles.title}>{t("register.submit")}</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              {field(
                "firstName",
                "register.firstNamePlaceholder",
                fields.firstName,
                (v) => set("firstName", v),
                { autoCapitalize: "words" },
              )}
            </View>

            <View style={styles.rowItem}>
              {field(
                "lastName",
                "register.lastNamePlaceholder",
                fields.lastName,
                (v) => set("lastName", v),
                { autoCapitalize: "words" },
              )}
            </View>
          </View>

          {field(
            "email",
            "register.emailPlaceholder",
            fields.email,
            (v) => set("email", v),
            { keyboardType: "email-address", autoCapitalize: "none" },
          )}

          <View style={styles.row}>
            <View style={styles.rowItem}>
              {field(
                "phone",
                "register.phonePlaceholder",
                fields.phone,
                (v) => set("phone", v),
                { keyboardType: "phone-pad", autoCapitalize: "none" },
              )}
            </View>

            <View style={styles.rowItem}>
              {field(
                "username",
                "register.usernamePlaceholder",
                fields.username,
                (v) => set("username", v),
                { autoCapitalize: "none" },
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              {field(
                "password",
                "register.passwordPlaceholder",
                fields.password,
                (v) => set("password", v),
                { secureTextEntry: true, autoCapitalize: "none" },
              )}
            </View>

            <View style={styles.rowItem}>
              {field(
                "confirmPassword",
                "register.passwordPlaceholder",
                fields.confirmPassword,
                (v) => set("confirmPassword", v),
                { secureTextEntry: true, autoCapitalize: "none" },
              )}
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <Text style={styles.buttonText}>
                {isSubmitting
                  ? t("register.submitting")
                  : t("register.submit")}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t("register.haveAccount")}</Text>

            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.switchLink}>{t("loginForm.submit")}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
