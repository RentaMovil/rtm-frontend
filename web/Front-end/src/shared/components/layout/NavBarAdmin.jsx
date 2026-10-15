import "./NavBarAdmin.css";
import { Link } from "react-router-dom";
import { FaCar, FaBars, FaTimes } from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import { useState } from "react";
import AdminPanel from "../../../features/admin/HomeAdmin/Components/AdminPanel.jsx";
import { useTranslation } from "react-i18next";

function NavbarAdmin() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const closeAll = () => {
    setOpen(false);
    setAdminOpen(false);
  };

  const toggleMenu = () => {
    setOpen((prev) => !prev);
    setAdminOpen(false);
  };

  const toggleAdminPanel = () => {
    setAdminOpen((prev) => !prev);
    setOpen(false);
  };

  return (
    <>
      <header className="navbar-admin">
        <div className="navbar-admin-content">
          <Link to="/HomeAdmin" className="navbar-admin-logo" onClick={closeAll}>
            <span className="logo-text">Renta<span className="logo-container2">Movil</span></span>
            <FaCar className="navbar-admin-logo-icon" />
          </Link>

          <nav className={`navbar-admin-links ${open ? "active" : ""}`}>
            <Link to="/HomeAdmin" onClick={closeAll}>
              {t("navbar.linkInit")}
            </Link>

            <Link to="/NotificationAdmin" onClick={closeAll}>
              {t("navbar.linkNotifications")}
            </Link>

              <Link
                to="/HistorialReservation"
                onClick={() => setOpen(false)}
            >
                {t("navbar.linkReservation")}
            </Link>

            <span
              className={`navbar-admin-panel-toggle ${adminOpen ? "active" : ""}`}
              onClick={toggleAdminPanel}
            >
              {t("navbar.linkPanelAdmin")}
            </span>

            <Link to="/account/admin" className="navbar-admin-profile" onClick={closeAll}>
              <MdPerson />
            </Link>
          </nav>

          <button className="navbar-admin-menu-button" onClick={toggleMenu}>
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}

export default NavbarAdmin;
