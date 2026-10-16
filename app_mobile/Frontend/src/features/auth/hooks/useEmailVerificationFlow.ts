import { useEffect, useState } from "react";

import { ApiError } from "../../../shared/api/httpClient";
import { useAuth } from "./useAuth";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

type Options = {
  email: string;
  t: (key: string, options?: Record<string, unknown>) => string;
};

/**
 * Confirma el codigo que llega al correo despues de registrarse (HU-IAM-001).
 * A diferencia de `usePasswordCodeFlow`, siempre arranca con el email ya
 * conocido (viene del registro o del 403 EMAIL_NOT_VERIFIED del login) y no
 * tiene paso de contrasena: si el codigo es valido, `verifyEmail` ya deja la
 * sesion iniciada.
 */
export function useEmailVerificationFlow({ email, t }: Options) {
  const { verifyEmail, resendEmailVerification } = useAuth();

  const [code, setCodeValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const setCode = (value: string) =>
    setCodeValue(value.replace(/\D/g, "").slice(0, CODE_LENGTH));

  const messageOf = (err: unknown): string =>
    err instanceof ApiError || err instanceof Error
      ? err.message
      : t("emailVerification.genericError");

  const isCodeComplete = code.length === CODE_LENGTH;

  async function submitCode() {
    if (loading || !isCodeComplete) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      await verifyEmail(email, code);
      // Si llega aqui la sesion ya quedo iniciada (verifyEmail guarda los
      // tokens); el guard de app/_layout.tsx lleva al menu solo.
    } catch {
      setError(t("emailVerification.invalidCode"));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (loading || cooldown > 0) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      await resendEmailVerification(email);
      setCodeValue("");
      setInfo(t("emailVerification.resent"));
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  return {
    code,
    setCode,
    isCodeComplete,
    loading,
    error,
    info,
    cooldown,
    submitCode,
    resend,
  };
}
