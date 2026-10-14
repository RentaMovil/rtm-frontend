import './ChangePasswordLogin.module.css'
import {  FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "../../../shared/components/layout/Navbar";
import Footer from '../../../shared/components/layout/Footer';
import { useTranslation } from "react-i18next";
import useChangePasswordLogin from "../hooks/useChangePasswordLogin.js";
import { RoleFooter, RoleNavbar } from '../../../shared/components/layout/RoleChrome.jsx';

function ChangePassword() {
    const { t } = useTranslation();

    const {
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
        getPasswordClass,
        getConfirmClass,
        handleChangePassword,
    } = useChangePasswordLogin(t);

    return (
        <>
            <RoleNavbar />

            <div className='containerP'>
                <div className='cardP'>
                    <div className='formP'>

                        <h2 className='form-labelP-title'>{t("changePassword.title")}</h2>
                        {error && <p className="errorMessageP invalidP">{error}</p>}

                        {/* No se requiere la contraseña actual en este flujo */}

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
                                    {showConfirm ? <FaEye /> : <FaEyeSlash />}
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