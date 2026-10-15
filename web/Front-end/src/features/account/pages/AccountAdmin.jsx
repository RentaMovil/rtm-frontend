import "./Account.css";
import AccountView from "../../auth/components/AccountView";

// Solo cambia el navbar y el pie, y ahora los elige el propio AccountView según
// el rol de quien está conectado. El envoltorio se conserva para no tocar las rutas.
function AccountAdmin({ theme, setTheme }) {
    return <AccountView theme={theme} setTheme={setTheme} />;
}

export default AccountAdmin;
