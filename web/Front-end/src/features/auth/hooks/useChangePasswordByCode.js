import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import { useDialog } from "../../../shared/components/dialog/dialogContext";
import { isPasswordValid } from "../utils/passWorrdValidation.js";
import {
    buildPasswordRules,
    getConfirmPasswordClassName,
    getPasswordClassName,
} from "../utils/changePasswordUtils.js";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

// Cambiar la contraseña con sesión iniciada usando un código enviado al correo de la cuenta.
// Pasos: "send" (pedir código) -> "code" (escribirlo) -> "password" (contraseña nueva).
// Usa los mismos endpoints de recuperar contraseña: forgot, verify-code y reset.
function useChangePasswordByCode(t) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { alert } = useDialog();
    const email = user?.email ?? "";

    const [step, setStep] = useState("send");
    const [code, setCodeValue] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [cooldown, setCooldown] = useState(0);

    // Cuenta regresiva para no pedir códigos seguidos
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    // Solo dígitos, máximo 6
    const setCode = (value) => setCodeValue(value.replace(/\D/g, "").slice(0, CODE_LENGTH));

    const passwordsMatch = password === confirmPassword;
    const isValid = isPasswordValid(password) && passwordsMatch;
    const isCodeComplete = code.length === CODE_LENGTH;
    const rules = buildPasswordRules(password, t);

    const getPasswordClass = () => getPasswordClassName(password, isPasswordValid(password));
    const getConfirmClass = () => getConfirmPasswordClassName(confirmPassword, passwordsMatch);

    // iam responde 202 aunque el correo no exista; por eso el mensaje no promete nada más
    const sendCode = async () => {
        setError("");
        setInfo("");
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setCodeValue("");
            setInfo(t("changePassword.codeSent", { email }));
            setCooldown(RESEND_SECONDS);
            setStep("code");
        } catch (err) {
            // ej. 429 si se pidieron demasiados códigos
            setError(err.message || t("changePassword.errorRequest"));
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        if (!isCodeComplete) return;
        setError("");
        setInfo("");
        setLoading(true);
        try {
            await authService.verifyCode(email, code);
            setStep("password");
        } catch {
            setError(t("changePassword.invalidCode"));
        } finally {
            setLoading(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authService.resetPassword({ email, code, newPassword: password });
            await alert({ message: t("changePassword.successPassword"), tone: "success" });
            // iam cerró todas las sesiones: se limpia lo local y se vuelve al login
            await logout();
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || t("changePassword.errorRequest"));
        } finally {
            setLoading(false);
        }
    };

    return {
        email, step, code, setCode, isCodeComplete,
        password, setPassword, confirmPassword, setConfirmPassword,
        showPassword, setShowPassword, showConfirm, setShowConfirm,
        loading, error, info, cooldown, passwordsMatch, isValid, rules,
        getPasswordClass, getConfirmClass,
        sendCode, verifyCode, submitPassword,
    };
}

export default useChangePasswordByCode;
