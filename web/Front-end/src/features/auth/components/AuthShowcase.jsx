import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaShieldAlt, FaKey } from "react-icons/fa";

import Quotes from "../../../shared/components/Quotes.jsx";
import LogoCar from "../../../shared/components/layout/LogoCar.jsx";
import "./AuthShowcase.css";

// Panel de marca a la izquierda del login/registro.
function AuthShowcase() {
  const { t } = useTranslation();

  return (
    <aside className="auth-showcase">
      <div className="auth-showcase-top">
        <div className="auth-showcase-logo">
          <h2>Renta<span>Movil</span></h2>
          <LogoCar className="auth-showcase-logo-icon" />
        </div>

        <span className="auth-showcase-badge">
          <FaCheckCircle /> {t("authShowcase.badge")}
        </span>

        <h1 className="auth-showcase-title">
          {t("authShowcase.titlePart1")}{" "}
          <span className="auth-showcase-highlight">
            {t("authShowcase.titleHighlight")}
          </span>
        </h1>

        <p className="auth-showcase-description">
          {t("authShowcase.description")}
        </p>

        <div className="auth-showcase-stats">
          <div className="auth-showcase-stat">
            <span className="auth-showcase-stat-value">{t("authShowcase.stat1Value")}</span>
            <span className="auth-showcase-stat-label">{t("authShowcase.stat1Label")}</span>
          </div>
          <div className="auth-showcase-stat">
            <span className="auth-showcase-stat-value">{t("authShowcase.stat2Value")}</span>
            <span className="auth-showcase-stat-label">{t("authShowcase.stat2Label")}</span>
          </div>
        </div>

        <div className="auth-showcase-feature">
          <span className="auth-showcase-feature-icon"><FaKey /></span>
          <div>
            <strong>{t("authShowcase.feature")}</strong>
            <p>{t("authShowcase.featureDesc")}</p>
          </div>
        </div>
      </div>

      <div className="auth-showcase-bottom">
        <div className="auth-showcase-quote">
          <Quotes />
        </div>
        <div className="auth-showcase-footer">
          <p>{t("authShowcase.footerNote")}</p>
          <span className="auth-showcase-ssl">
            <FaShieldAlt /> {t("authShowcase.ssl")}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default AuthShowcase;
