import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";

function SessionLoading() {
    const { t } = useTranslation();
    return <p className="route-loading">{t("common.loadingSession")}</p>;
}

export function RequireAuth({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <SessionLoading />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return children;
}

// Home de cada rol: a donde se manda a alguien que entra a una ruta que no le toca
function homeFor(role) {
    return ["ADMIN", "SUPER_ADMIN"].includes(role) ? "/HomeAdmin" : "/home";
}

// roles: quiénes pueden entrar. permission (opcional): además debe tener ese permiso.
// Esto solo oculta pantallas; quien protege los datos es el backend (401/403).
export function RequireRole({ children, roles = [], permission }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <SessionLoading />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    const hasRole = roles.length === 0 || roles.includes(user.role);
    const hasPermission = !permission || user.permissions?.includes(permission);

    if (!hasRole || !hasPermission) {
        return <Navigate to={homeFor(user.role)} replace />;
    }

    return children;
}