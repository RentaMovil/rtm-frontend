import { FaEye, FaEyeSlash } from "react-icons/fa";
import useChangePasswordByCode from "../hooks/useChangePasswordByCode.js";

// Método "con código al correo" de la pantalla Cambiar contraseña. Se muestra dentro de .formP.
function ChangePasswordByCode({ t }) {
    const {
        email, step, code, setCode, isCodeComplete,
        password, setPassword, confirmPassword, setConfirmPassword,
        showPassword, setShowPassword, showConfirm, setShowConfirm,
        loading, error, info, cooldown, passwordsMatch, isValid, rules,
        getPasswordClass, getConfirmClass,
        sendCode, verifyCode, submitPassword,
    } = useChangePasswordByCode(t);

    return (
        <>
            {error && <p className="errorMessageP invalidP">{error}</p>}
            {info && !error && <p className="infoMessageP">{info}</p>}

            {step === "send" && (
                <>
                    <p className="hintP">{t("changePassword.codeIntro", { email })}</p>
                    <button
                        type="button"
                        className="buttonP"
                        disabled={loading || !email}
                        onClick={sendCode}
                    >
                        {loading ? t("changePassword.sending") : t("changePassword.sendCode")}
                    </button>
                </>
            )}

            {step === "code" && (
                <form className="codeFormP" onSubmit={verifyCode}>
                    <label className="form-labelP codeLabelP" htmlFor="verificationCode">
                        {t("changePassword.codeLabel")}
                    </label>
                    <input
                        id="verificationCode"
                        className="inputBaseP codeInputP"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="buttonP"
                        disabled={!isCodeComplete || loading}
                    >
                        {loading ? t("changePassword.verifying") : t("changePassword.verifyCode")}
                    </button>
                    <button
                        type="button"
                        className="linkButtonP"
                        disabled={loading || cooldown > 0}
                        onClick={sendCode}
                    >
                        {cooldown > 0
                            ? t("changePassword.resendIn", { seconds: cooldown })
                            : t("changePassword.resendCode")}
                    </button>
                </form>
            )}

            {step === "password" && (
                <form className="codeFormP" onSubmit={submitPassword}>
                    <div className="inputGroupP">
                        <label className="form-labelP" htmlFor="codeNewPassword">
                            {t("changePassword.newPassword")}
                        </label>
                        <div className="inputWrapperP">
                            <input
                                id="codeNewPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={getPasswordClass()}
                            />
                            <button
                                type="button"
                                className="eyeIconP"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Mostrar u ocultar contraseña"
                                aria-pressed={showPassword}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="rulesContainer">
                        <ul className="list">
                            {rules.map((rule, index) => (
                                <li key={index} className={rule.valid ? "validP" : "invalidP"}>
                                    {rule.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="inputGroupP">
                        <label className="form-labelP" htmlFor="codeConfirmPassword">
                            {t("changePassword.confirmPassword")}
                        </label>
                        <div className="inputWrapperP">
                            <input
                                id="codeConfirmPassword"
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={getConfirmClass()}
                            />
                            <button
                                type="button"
                                className="eyeIconP"
                                onClick={() => setShowConfirm(!showConfirm)}
                                aria-label="Mostrar u ocultar confirmación"
                                aria-pressed={showConfirm}
                            >
                                {showConfirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="errorMessageP invalidP">{t("changePassword.invalid")}</p>
                    )}

                    <button
                        type="submit"
                        className="buttonP"
                        disabled={!isValid || loading}
                    >
                        {loading ? t("changePassword.saving") : t("changePassword.save")}
                    </button>
                </form>
            )}
        </>
    );
}

export default ChangePasswordByCode;
