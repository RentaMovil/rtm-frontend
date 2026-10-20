import "./Navbar.css";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import LogoCar from "./LogoCar";
import { MdPerson } from "react-icons/md";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AuthLink from "../AuthLink.jsx";

    function Navbar() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <header className="navbar">
        <div className="navbar-content">

            <Link to="/Home" className="logo-container">
            <span className="logo-text">Renta<span className="logo-container2">Movil</span></span>
            <LogoCar className="logo-icon" />
            </Link>

        <nav className={`nav-links ${open ? "active" : ""}`}>

            <Link
                to="/Home"
                onClick={() => setOpen(false)}
            >
                {t("navbar.linkInit")}
            </Link>

            <AuthLink
                to="/Notification"
                onClick={() => setOpen(false)}
            >
                {t("navbar.linkNotifications")}
            </AuthLink>

            <AuthLink
                to="/HistorialReservation"
                onClick={() => setOpen(false)}
            >
                {t("navbar.linkReservation")}
            </AuthLink>

            <AuthLink
                to="/account"
                className="profile-link"
                onClick={() => setOpen(false)}
            >
                <MdPerson />
            </AuthLink>
            </nav>

            <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            >
            {open ? <FaTimes /> : <FaBars />}
            </button>

        </div>
        </header>
    );
    }

export default Navbar;
