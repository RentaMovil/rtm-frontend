import './ChangePassword.css'
import {  FaEye, FaEyeSlash } from "react-icons/fa";
import { RoleNavbar, RoleFooter } from "../../../shared/components/layout/RoleChrome.jsx";
import { useTranslation } from "react-i18next";
import useChangePassword from "../hooks/useChangePassword.js";

function ChangePassword() {
    const { t } = useTranslation();

    const {
        currentPassword,
        setCurrentPassword,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        setShowPassword,
        showConfirm,
        setShowConfirm,
        loading,
        error,
        passwordsMatch,
        isValid,
        rules,
        getCurrentPasswordClass,
        getPasswordClass,
        getConfirmClass,
        handleChangePassword,
    } = useChangePassword(t);

    return (
        <>
            <RoleNavbar />

            <div className='containerP'>
                <div className='cardP'>
                    <div className='formP'>

                        <h2 className='form-labelP-title'>{t("changePassword.title")}</h2>
                        {error && <p className="errorMessageP invalidP">{error}</p>}
                        <div className="inputGroupP">
                            <label className='form-labelP' htmlFor='currentPassword'>
                                {t('changePassword.currentPassword')}
                            </label>
                            <div className="inputWrapperP">
                                <input
                                    id='currentPassword'
                                    type={showPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={getCurrentPasswordClass()}
                                />

                                {/* Comparte el toggle del campo nuevo */}
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
                        <div className="inputGroupP">
                            <label className='form-labelP' htmlFor='newPassword'>
                                {t('changePassword.newPassword')}
                            </label>

                            <div className="inputWrapperP">
                                <input
                                    id='newPassword'
                                    type={showPassword ? "text" : "password"}
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
                                    {showPassword ? <FaEyeSlash /> : <FaEye /> }
                                </button>
                            </div>
                        </div>
                        <div className='rulesContainer'>
                            <ul className='list'>
                            {rules.map((rule, index) => (
                                <li
                                    key={index}
                                    className={rule.valid ? "validP" : "invalidP"}
                                >
                                    {rule.label}
                                </li>
                            ))}
                        </ul>
                        </div>
                        <div className="inputGroupP">
                            <label className='form-labelP' htmlFor='confirmPassword'>
                                {t('changePassword.confirmPassword')}
                            </label>

                            <div className="inputWrapperP">
                                <input
                                    id='confirmPassword'
                                    type={showConfirm ? "text" : "password"}
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
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="errorMessageP invalidP">
                                    {t('changePassword.invalid')}
                                </p>
                            )}
                        </div>

                        <button
                            type='button'
                            className='buttonP'
                            disabled={!isValid || loading}
                            onClick={handleChangePassword}
                        >
                            {loading ? t('changePassword.saving') : t('changePassword.save')}
                        </button>

                    </div>
                </div>
            </div>

            <RoleFooter />
        </>
    );
}

export default ChangePassword;