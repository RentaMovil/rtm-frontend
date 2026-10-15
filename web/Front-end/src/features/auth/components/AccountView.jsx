import { useEffect, useState } from "react";
import { FaGlobe, FaMoon, FaPen, FaSignOutAlt, FaTimes, FaInfoCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { RoleNavbar, RoleFooter } from "../../../shared/components/layout/RoleChrome";
import ButtonBack from "../../../shared/components/buttonBack";
import { useAuth } from "../../../contexts/AuthContext";
import ProfileIdentity from "./ProfileIdentity";

import espanish from "../../../assets/img/espana.png";
import english from "../../../assets/img/eeuu.png";
import french from "../../../assets/img/francia2.png";
import portuguese from "../../../assets/img/portugal.png";


export default function AccountView({ theme, setTheme }) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user, isLoading, error, refreshProfile, updateProfile, changeEmail, logout } = useAuth();

    // El login no trae el teléfono ni la foto actualizada: al entrar se pide el perfil completo
    useEffect(() => {
        refreshProfile().catch(() => {});
    }, [refreshProfile]);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showLangModal, setShowLangModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Cambio de correo (HU-IAM-004). Vive en su propio modal, no en el modo
    // edicion del perfil: la confirmacion es la contrasena actual, no un
    // guardado mas.
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [emailChanged, setEmailChanged] = useState(false);

    // Modo edicion del perfil. El boton de la lapiz lo alterna; mientras esta
    // activo los campos pasan de solo lectura a editables y aparece Guardar.
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const toggleEdit = () => {
        setIsEditing((v) => !v);
        setSaved(false);
    };

    const handleSave = async (changes) => {
        // Sin cambios no se llama a la API: se cierra el modo edicion
        // directamente. El backend responde 400 si se le manda el cuerpo
        // vacio, y eso al usuario le pareceria un fallo.
        const hayCambios = Object.keys(changes ?? {}).length > 0;

        setIsSaving(true);
        try {
            if (hayCambios) {
                await updateProfile(changes);
            }
            setIsEditing(false);
            setSaved(hayCambios);
        } catch {
            // El mensaje del backend queda en el error de AuthContext y se muestra arriba
        } finally {
            setIsSaving(false);
        }
    };

    const openEmailModal = () => {
        setNewEmail("");
        setCurrentPassword("");
        setEmailError("");
        setShowEmailModal(true);
    };

    const closeEmailModal = () => {
        // Mientras va la peticion el modal se queda abierto: cerrarlo a mitad
        // dejaria al usuario sin saber si el cambio se aplico.
        if (isChangingEmail) return;
        setShowEmailModal(false);
    };

    const handleChangeEmail = async (event) => {
        event.preventDefault();
        setEmailError("");

        const correo = newEmail.trim();

        // Comprobaciones minimas antes de ir al servidor. No sustituyen las
        // del backend: solo evitan un viaje de red con algo que ya se sabe.
        if (!correo) {
            setEmailError(t("changeEmail.required"));
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            setEmailError(t("changeEmail.invalidEmail"));
            return;
        }
        if (correo.toLowerCase() === (user?.email ?? "").toLowerCase()) {
            setEmailError(t("changeEmail.sameEmail"));
            return;
        }
        if (!currentPassword) {
            setEmailError(t("changeEmail.passwordRequired"));
            return;
        }

        setIsChangingEmail(true);
        try {
            await changeEmail(correo, currentPassword);
            setShowEmailModal(false);
            setNewEmail("");
            setCurrentPassword("");
            setEmailChanged(true);
        } catch {
            // Un solo mensaje para cualquier fallo — contrasena incorrecta,
            // correo ya registrado (INV-001) o backend caido. El usuario no
            // puede actuar distinto segun la causa, asi que no se distingue.
            setEmailError(t("changeEmail.error"));
        } finally {
            setIsChangingEmail(false);
        }
    };

    const handleLangChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
        setShowLangModal(false);
    };

    const handleRetry = async () => {
        try {
            await refreshProfile();
        } catch {
            // El error queda expuesto en el estado de AuthContext.
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
        setShowLogoutModal(false);
    };

    if (isLoading) {
        return <p className="route-loading">Cargando perfil...</p>;
    }

    if (!user) {
        return (
            <>
                <RoleNavbar />
                <div className="containerC">
                    <div className="cardC">
                        <p className="account-error" role="alert">
                            {error || "No hay una sesión disponible."}
                        </p>
                        <div className="actions account-actions-fallback">
                            <button
                                className="close-btn"
                                type="button"
                                onClick={handleRetry}
                            >
                                {t("account.retry")}
                            </button>
                            <Link className="linkC" to="/">
                                {t("account.signIn")}
                            </Link>
                        </div>
                    </div>
                </div>
                <RoleFooter />
                <RoleFooter />
            </>
        );
    }

    return (
        <>
            <RoleNavbar />
            <RoleNavbar />
            <div className="containerC">
                <div className="cardC">
                    <div className="header-page">
                        <div className="header-left">
                            {/* `normal` y no `overlay`: la variante overlay es
                                `position: absolute`, y dentro de `.header-left`
                                se salia del flujo y se montaba encima del
                                estado de perfil. */}
                            <ButtonBack
                                onClick={() => navigate(-1)}
                                variant="normal"
                            />

                            <p className="status2">
                                {t("account.profileStatus")}
                            </p>
                        </div>

                        <div className="actions">
                            <button
                                className={`icon-btnC ${isEditing ? "icon-btnC--on" : ""}`}
                                type="button"
                                onClick={toggleEdit}
                                aria-label={isEditing ? t("account.cancelar") : t("account.editar")}
                                title={isEditing ? t("account.cancelar") : t("account.editar")}
                            >
                                {isEditing ? <FaTimes /> : <FaPen />}
                            </button>

                            <button
                                className="icon-btnC"
                                type="button"
                                onClick={() => setShowThemeModal(true)}
                                aria-label={t("account.seleccionaTema")}
                                title={t("account.seleccionaTema")}
                            >
                                <FaMoon />
                            </button>
                            <button
                                className="icon-btnC"
                                type="button"
                                onClick={() => setShowLangModal(true)}
                                aria-label={t("account.seleccionaIdioma")}
                                title={t("account.seleccionaIdioma")}
                            >
                                <FaGlobe />
                            </button>
                            <button
                                className="icon-btnC"
                                type="button"
                                onClick={() => setShowLogoutModal(true)}
                                aria-label={t("account.logout")}
                                title={t("account.logout")}
                            >
                                <FaSignOutAlt />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="account-error" role="alert">
                            {error}
                        </p>
                    )}

                    {saved && !isEditing && (
                        <p className="account-saved" role="status">
                            {t("account.perfilActualizado")}
                        </p>
                    )}

                    {emailChanged && (
                        <p className="account-saved" role="status">
                            {t("changeEmail.success")}
                        </p>
                    )}

                    <div className="formC">
                        <ProfileIdentity
                            user={user}
                            isEditing={isEditing}
                            onSave={handleSave}
                            isSaving={isSaving}
                            onChangeEmail={openEmailModal}
                        />
                    </div>
                </div>
            </div>

            {showThemeModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowThemeModal(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="btn-times btn-times--corner"
                            type="button"
                            onClick={() => setShowThemeModal(false)}
                            aria-label={t("account.cancelar")}
                        >
                            <FaTimes />
                        </button>

                        <p className="modal-title">
                            {t("account.seleccionaTema")}
                        </p>
                        <div className="theme-grid">
                            {[
                                {
                                    id: "skylight",
                                    label: "Modo claro",
                                    desc: "Fondo blanco, barra azul marino",
                                },
                                {
                                    id: "light",
                                    label: "Modo claro neutro",
                                    desc: "Fondo blanco, acentos ámbar",
                                },
                                {
                                    id: "dark",
                                    label: "Modo oscuro neutro",
                                    desc: "Fondo gris muy oscuro, acento dorado",
                                },
                                {
                                    id: "darkPurple",
                                    label: "Modo oscuro azul",
                                    desc: "Fondo azul noche, acento dorado",
                                },
                            ].map(({ id, label, desc }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={`theme-card ${
                                        theme === id ? "active2" : ""
                                    }`}
                                    onClick={() => setTheme(id)}
                                >
                                    <div
                                        className={`theme-preview preview-${id}`}
                                        aria-hidden="true"
                                    >
                                        <div className="theme-preview-bar" />
                                        <div className="theme-preview-body">
                                            <div className="theme-preview-surface" />
                                            <div className="theme-preview-accent" />
                                        </div>
                                    </div>
                                    <div className="theme-card-info">
                                        <p className="theme-name">{label}</p>
                                        <p className="theme-desc">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showEmailModal && (
                <div
                    className="modal-overlay"
                    onClick={closeEmailModal}
                >
                    <div
                        className="modal-content"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="change-email-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="btn-times btn-times--corner"
                            type="button"
                            onClick={closeEmailModal}
                            aria-label={t("account.cancelar")}
                        >
                            <FaTimes />
                        </button>

                        <p className="modal-title" id="change-email-title">
                            {t("changeEmail.title")}
                        </p>

                        <div className="ce-banner">
                            <FaInfoCircle />
                            <span>{t("changeEmail.securityNotice")}</span>
                        </div>

                        <form onSubmit={handleChangeEmail} noValidate>
                            <div className="form-groupC">
                                <label
                                    className="form-labelC"
                                    htmlFor="ce-current-email"
                                >
                                    {t("changeEmail.currentEmail")}
                                </label>
                                <input
                                    id="ce-current-email"
                                    className="inputC"
                                    type="text"
                                    value={user?.email || ""}
                                    disabled
                                />
                            </div>

                            <div className="form-groupC">
                                <label
                                    className="form-labelC"
                                    htmlFor="ce-new-email"
                                >
                                    {t("changeEmail.newEmail")}
                                </label>
                                <input
                                    id="ce-new-email"
                                    className="inputC"
                                    type="email"
                                    autoComplete="email"
                                    placeholder={t("changeEmail.newEmailPlaceholder")}
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    disabled={isChangingEmail}
                                />
                            </div>

                            <div className="form-groupC">
                                <label
                                    className="form-labelC"
                                    htmlFor="ce-current-password"
                                >
                                    {t("changeEmail.currentPassword")}
                                </label>
                                <div className="password-input-wrap">
                                    <input
                                        id="ce-current-password"
                                        className="inputC"
                                        type={showCurrentPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder={t("changeEmail.currentPasswordPlaceholder")}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        disabled={isChangingEmail}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                        disabled={isChangingEmail}
                                        aria-label={t("loginForm.showPassword")}
                                        title={t("loginForm.showPassword")}
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <span className="ce-hint">
                                    {t("changeEmail.passwordHint")}
                                </span>
                            </div>

                            {emailError && (
                                <p className="account-error" role="alert">
                                    {emailError}
                                </p>
                            )}

                            <div className="ce-actions">
                                <button
                                    className="ce-btn-ghost"
                                    type="button"
                                    onClick={closeEmailModal}
                                    disabled={isChangingEmail}
                                >
                                    {t("changeEmail.cancel")}
                                </button>

                                <button
                                    className="btn-saveProfile"
                                    type="submit"
                                    disabled={isChangingEmail}
                                >
                                    {isChangingEmail
                                        ? t("changeEmail.saving")
                                        : t("changeEmail.confirm")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showLangModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowLangModal(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="btn-times btn-times--corner"
                            type="button"
                            onClick={() => setShowThemeModal(false)}
                            aria-label={t("account.cancelar")}
                        >
                            <FaTimes />
                        </button>

                        <p className="modal-title">
                            {t("account.seleccionaIdioma")}
                        </p>
                        <div className="theme-grid">
                            {[
                                {
                                    id: "es",
                                    label: "Español",
                                    flag: espanish,
                                    desc: "Spanish",
                                },
                                {
                                    id: "en",
                                    label: "English",
                                    flag: english,
                                    desc: "Inglés",
                                },
                                {
                                    id: "fr",
                                    label: "Français",
                                    flag: french,
                                    desc: "Francés",
                                },
                                {
                                    id: "pt",
                                    label: "Português",
                                    flag: portuguese,
                                    desc: "Portugués",
                                },
                            ].map(({ id, label, flag, desc }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={`theme-card ${
                                        i18n.language === id ? "active" : ""
                                    }`}
                                    onClick={() => handleLangChange(id)}
                                >
                                    <div className="lang-preview">
                                        <img
                                            className="lang-flag"
                                            src={flag}
                                            alt={label}
                                        />
                                    </div>
                                    <div className="theme-card-info">
                                        <p className="theme-name">{label}</p>
                                        <p className="theme-desc">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN */}
            {showLogoutModal && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <p>
                            ¿Estás seguro de que deseas <strong>cerrar sesión</strong>?
                        </p>
                        <div className="modal-actions">
                            <button className="btn-negative" onClick={() => setShowLogoutModal(false)}>
                                {t("account.cancelar", "Cancelar")}
                            </button>
                            <button className="btn-danger" onClick={handleLogout}>
                                {t("account.confirmLogout", "Sí, Cerrar Sesión")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <RoleFooter />
        </>
    );
}
