import { useState } from "react";
import { useTranslation } from "react-i18next";

import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import AuthShowcase from "../components/AuthShowcase.jsx";
import AuthTopbar from "../components/AuthTopbar.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import "./Login.css";

// ADMIN y SUPER_ADMIN van al panel de administración. Comparar solo con "ADMIN"
// mandaba al SUPER_ADMIN a /home, que es el panel de cliente.
const isAdminRole = (role) => role === "ADMIN" || role === "SUPER_ADMIN";

function Login({ theme, setTheme }) {
    const { t } = useTranslation();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleLogin = async (credentials) => {
        const session = await login(credentials);

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
        <div className="auth-page">
            <AuthTopbar
                isLoginMode={isLoginMode}
                onSelectMode={setIsLoginMode}
                theme={theme}
                setTheme={setTheme}
            />

            <div className="auth-modal">
                <AuthShowcase />

                <div className="auth-card-wrapper">
                    <div className={`auth-card ${isLoginMode ? "" : "auth-card-wide"}`}>
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

                        {isLoginMode ? (
                            <LoginForm onSubmit={handleLogin} />
                        ) : (
                            <RegisterForm onSubmit={handleRegister} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
