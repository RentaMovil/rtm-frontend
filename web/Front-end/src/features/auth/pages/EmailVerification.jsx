import style from "./EmailVerification.module.css";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineDashboard, AiOutlineMail, AiOutlineArrowRight, AiOutlineLock, AiOutlineSafety } from 'react-icons/ai';
import NavbarTwo from "../../../shared/components/layout/NavbarTwo";
import Footer from '../../../shared/components/layout/Footer';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';


function EmailVerification({ email }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const initialEmail = email || location.state?.email || '';
    const { register, formState: { errors }, handleSubmit, reset } = useForm();
    const [sendError, setSendError] = useState('');
    const [isSending, setIsSending] = useState(false);

    // iam responde 202 exista o no el correo (no revela qué correos están registrados)
    async function insert(data) {
        setSendError('');
        setIsSending(true);
        
        try {
            await authService.forgotPassword(data.email);
            reset();
            navigate('/CodeVerification', { state: { email: data.email } });
        } catch (err) {
            // ej. 429 si se pidieron demasiados códigos
            setSendError(err.message || 'No se pudo enviar el código');
        } finally {
            setIsSending(false);
        }
    }

    return (
        <>
            <NavbarTwo />

            <div className={style["page-background"]}>
                <div className={style["container-email"]}>
                    <form className={style['email-form']} onSubmit={handleSubmit(insert)}>
                        <h2 className={style["title"]}>Ingrese su correo electrónico</h2>
                        <p className={style["description"]}>
                            Le enviaremos un código de seguridad para verificar su identidad y continuar
                        </p>

                        <div className={style["input-wrapper"]}>
                            <AiOutlineMail className={style["input-icon"]} />
                            <input
                                className={style["input-email"]}
                                id="email"
                                type="email"
                                defaultValue={initialEmail}
                                autoComplete='username'
                                placeholder={t('loginForm.emailPlaceholder')}
                                {...register("email", {
                                    required: "El correo electrónico es necesario",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Formato de correo electrónico es inválido"
                                    }
                                })} />
                        </div>

                        {errors.email && (
                            <p className={style['error-message']}>
                                <AiOutlineDashboard /> {errors.email.message}
                            </p>
                        )}

                        {sendError && (
                            <p className={style['error-message']}>
                                <AiOutlineDashboard /> {sendError}
                            </p>
                        )}

                        <button 
                            type="submit" 
                            className={style["confirm-button"]}
                            disabled={isSending}
                        >
                            {isSending ? (
                                <>
                                    <span className={style["spinner"]}></span>
                                    Enviando código...
                                </>
                            ) : (
                                <>
                                    Confirmar
                                    <AiOutlineArrowRight className={style["button-icon"]} />
                                </>
                            )}
                        </button>

                    </form>

                    <div className={style["security-footer"]}>
                        <div className={style["security-item"]}>
                            <AiOutlineLock />
                            <span>SSL Verificado</span>
                        </div>
                        <div className={style["security-item"]}>
                            <AiOutlineSafety />
                            <span>Datos Protegidos</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}
export default EmailVerification;