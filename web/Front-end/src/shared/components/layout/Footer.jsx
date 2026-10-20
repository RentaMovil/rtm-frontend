import "./Footer.css";
import { FaCar, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLink from "../AuthLink.jsx";


function Footer() {
    const { t } = useTranslation();
return (
    <footer>
    <div className="footer-container">
        <div className="footer-links">
        <h3>{t("footer.links")}</h3>
        <div className="links">
        <Link to="/home">{t("footer.linkInit")}</Link>
        <AuthLink to="/notification">{t("footer.linkNotifications")}</AuthLink>
        <AuthLink to="/account">{t("footer.linkAccount")}</AuthLink>

    </div>
        </div>
        <div className="footer-brand">
            <h2>
                <FaCar className="icon2" />
                RentaMovil
            </h2>
            <div className="social-icons">
                <a   href="https://www.instagram.com"  target="_blank" rel="noopener noreferrer">
                <button className="btn-redes"><FaInstagram className="icon"/></button>
                </a>
                <a href="https://web.whatsapp.com/"  target="_blank" rel="noopener noreferrer">
                <button className="btn-redes"><FaWhatsapp className="icon" /></button>
                </a>
                <a href="https://www.tiktok.com/en/"  target="_blank" rel="noopener noreferrer">
                <button className="btn-redes"><FaTiktok className="icon" /></button>
                </a>
            </div>
            <p>{t("footer.paragraph")}</p>
            </div>
        <div className="footer-contact">
        <h3>{t("footer.contact")}</h3>
        <p>📞 3164763160</p>
        <p> 📍Calle 25 #36-60</p>
        </div>
    </div>

    <div className="footer-bottom">
        <p>{t("footer.description")}</p>
    </div>
    </footer>
);
}

export default Footer;
