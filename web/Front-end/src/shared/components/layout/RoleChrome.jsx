import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import NavBarAdmin from "./NavBarAdmin.jsx";
import FooterAdmin from "./FooterAdmin.jsx";
import { useAuth } from "../../../contexts/AuthContext";

// Barra y pie exigidos: los usa quien todavía no tiene sesión o la está cargando.
// La lista de roles admin es la misma que aplica ProtectedRoute.
const ROLES_ADMIN = ["ADMIN", "SUPER_ADMIN"];

/**
 * Navbar y Footer únicos para las páginas que ven cliente y administrador.
 * Eligen por el rol de quien está conectado, así la misma pantalla muestra
 * la barra y los enlaces que le corresponden a ese usuario.
 *
 * Las páginas exclusivas de admin no los usan: ahí van NavBarAdmin y
 * FooterAdmin directamente, porque no hay nadie más que pueda abrirlas.
 */
export function RoleNavbar() {
    const { user } = useAuth();

    return ROLES_ADMIN.includes(user?.role) ? <NavBarAdmin /> : <Navbar />;
}

export function RoleFooter() {
    const { user } = useAuth();

    return ROLES_ADMIN.includes(user?.role) ? <FooterAdmin /> : <Footer />;
}
