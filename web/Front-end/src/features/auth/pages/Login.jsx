import { useState } from "react";

import NavbarTwo from "../../../shared/components/layout/NavbarTwo.jsx";
import FooterTwo from "../../../shared/components/layout/FooterTwo.jsx";
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import "./Login.css";

// ADMIN y SUPER_ADMIN van al panel de administración. Comparar solo con "ADMIN"
// mandaba al SUPER_ADMIN a /home, que es el panel de cliente.
const isAdminRole = (role) => role === "ADMIN" || role === "SUPER_ADMIN";

function Login() {
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
        const session = await register(formData);
        navigate(isAdminRole(session.user.role) ? "/HomeAdmin" : "/home");
    };

    return (
        <>
            <NavbarTwo />

            <div className="login-container">

                {/* Formularios */}
                <div className="login-form-container">
                    {isLoginMode ? (
                        <LoginForm
                            onSubmit={handleLogin}
                            onSwitchToRegister={() => setIsLoginMode(false)}
                        />
                    ) : (
                        <RegisterForm
                            onSubmit={handleRegister}
                            onSwitchToLogin={() => setIsLoginMode(true)}
                        />
                    )}
                </div>

            </div>

        </>
    );
}

export default Login;