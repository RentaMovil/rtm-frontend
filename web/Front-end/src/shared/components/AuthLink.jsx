import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Como <Link>, pero si no hay sesión manda a login en vez de la ruta
 * protegida. El home y el catálogo son públicos; notificaciones, reservas,
 * cuenta y "continuar" en un vehículo no lo son.
 */
export default function AuthLink({ to, onClick, children, ...props }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/");
      return;
    }
    onClick?.(e);
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
