import { useEffect, useState } from "react";

import { ApiError } from "../../../shared/api/httpClient";
import { buildPasswordRules, isPasswordValid } from "../utils/passwordRules";
import { useAuth } from "./useAuth";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "email": pide el correo (olvide mi contrasena, sin sesion).
 * "send": el correo ya se conoce (cambiar con sesion iniciada), solo confirma el envio.
 * "code": escribir el codigo de 6 digitos.
 * "password": contrasena nueva.
 */
export type PasswordCodeStep = "email" | "send" | "code" | "password";

type Options = {
  /** Correo de la sesion. Si viene, se salta el paso de pedir el correo. */
  fixedEmail?: string;
  t: (key: string, options?: Record<string, unknown>) => string;
  /** Se llama cuando la contrasena ya se cambio. */
  onDone: () => Promise<void> | void;
};

/**
 * Flujo de cambiar contrasena con un codigo enviado al correo. Lo usan el
 * "olvide mi contrasena" del login y el cambio de contrasena con sesion
 * iniciada: ambos llaman a los mismos endpoints de iam (forgot, verify-code,
 * reset). iam cierra todas las sesiones al cambiarla.
 */
export function usePasswordCodeFlow({ fixedEmail, t, onDone }: Options) {
  const { forgotPassword, verifyCode, resetPassword } = useAuth();

  const [step, setStep] = useState<PasswordCodeStep>(
    fixedEmail ? "send" : "email",
  );
  const [emailInput, setEmailInput] = useState("");
  const [code, setCodeValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const email = (fixedEmail ?? emailInput).trim().toLowerCase();

  // Cuenta regresiva para no pedir codigos seguidos
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  // Solo digitos, maximo 6
  const setCode = (value: string) =>
    setCodeValue(value.replace(/\D/g, "").slice(0, CODE_LENGTH));

  const messageOf = (err: unknown): string =>
    err instanceof ApiError || err instanceof Error
      ? err.message
      : t("passwordRecovery.genericError");

  const isEmailValid = EMAIL_REGEX.test(email);
  const isCodeComplete = code.length === CODE_LENGTH;
  const passwordsMatch = password === confirmPassword;
  const isPasswordFormValid = isPasswordValid(password) && passwordsMatch;
  const rules = buildPasswordRules(password, t);

  // iam responde 202 aunque el correo no exista: no se promete mas que eso
  async function sendCode() {
    if (loading || !isEmailValid) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setCodeValue("");
      setInfo(t("passwordRecovery.codeSent", { email }));
      setCooldown(RESEND_SECONDS);
      setStep("code");
    } catch (err) {
      // ej. 429 si se pidieron demasiados codigos
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  async function submitCode() {
    if (loading || !isCodeComplete) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      await verifyCode(email, code);
      setStep("password");
    } catch {
      setError(t("passwordRecovery.invalidCode"));
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword() {
    if (loading || !isPasswordFormValid) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(email, code, password);
      await onDone();
    } catch (err) {
      setError(messageOf(err));
      setLoading(false);
    }
  }

  return {
    step,
    email,
    emailInput,
    setEmailInput,
    isEmailValid,
    code,
    setCode,
    isCodeComplete,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    passwordsMatch,
    isPasswordFormValid,
    rules,
    loading,
    error,
    info,
    cooldown,
    sendCode,
    submitCode,
    submitPassword,
  };
}
