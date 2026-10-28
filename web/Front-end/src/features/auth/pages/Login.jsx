import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import AuthShowcase from "../components/AuthShowcase.jsx";
import AuthTopbar from "../components/AuthTopbar.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import "./Login.css";

// ADMIN y SUPER_ADMIN van al panel de administración. Comparar solo con "ADMIN"
// mandaba al SUPER_ADMIN a /home, que es el panel de cliente.
const isAdminRole = (role) => role === "ADMIN" || role === "SUPER_ADMIN";

function Login({ theme, setTheme }) {
    const { t } = useTranslation();
    const [isLoginMode, setIsLoginMode] = useState(true);
    // El contenido va un paso atrás del tab que se ve activo: primero se
    // desvanece lo viejo, LUEGO cambian ancho/contenido juntos y entra lo
    // nuevo. Cambiar el ancho de la tarjeta a la vez que aparecen los campos
    // es lo que se sentía brusco.
    const [displayedMode, setDisplayedMode] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();

    useEffect(() => {
        if (isLoginMode === displayedMode) return;
        setIsLeaving(true);
        const timer = setTimeout(() => {
            setDisplayedMode(isLoginMode);
            setIsLeaving(false);
        }, 150);
        return () => clearTimeout(timer);
    }, [isLoginMode, displayedMode]);

    const handleLogin = async (credentials) => {
        const session = await login(credentials);

        // Si llegó al login desde /Reservation o /account (ProtectedRoute o
        // CartVehicule guardan "from" en el state), vuelve ahí en vez del
        // home por defecto. "fromState" trae los datos del vehículo elegido.
        const { from, fromState } = location.state ?? {};
        if (from) {
            navigate(from, fromState ? { state: fromState } : undefined);
            return;
        }

        navigate(
            isAdminRole(session.user.role)
                ? "/HomeAdmin"
                : "/home",
        );
    };

    const handleRegister = async (formData) => {
        const { email } = await register(formData);
        // Queda PENDING_VERIFICATION: confirma el código antes de poder entrar
        navigate("/CodeVerification", { state: { email, mode: "register" } });
    };

    return (
        <>
            <AuthTopbar
                isLoginMode={isLoginMode}
                onSelectMode={setIsLoginMode}
                theme={theme}
                setTheme={setTheme}
            />

            <div className="auth-page">
            <div className="auth-modal">
                <AuthShowcase />

                <div className="auth-card-wrapper">
                    <div className="auth-card">
                        <div className="auth-card-header">
                            <div className="auth-tabs" role="tablist">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={isLoginMode}
                                    className={`auth-tab ${isLoginMode ? "active" : ""}`}
                                    onClick={() => setIsLoginMode(true)}
                                >
                                    {t("loginForm.submit")}
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={!isLoginMode}
                                    className={`auth-tab ${!isLoginMode ? "active" : ""}`}
                                    onClick={() => setIsLoginMode(false)}
                                >
                                    {t("register.submit")}
                                </button>
                            </div>
                        </div>

                        <div
                            className={`auth-form-transition ${isLeaving ? "auth-form-leaving" : ""}`}
                            key={displayedMode ? "login" : "register"}
                        >
                            {displayedMode ? (
                                <LoginForm onSubmit={handleLogin} />
                            ) : (
                                <RegisterForm onSubmit={handleRegister} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}

export default Login;
