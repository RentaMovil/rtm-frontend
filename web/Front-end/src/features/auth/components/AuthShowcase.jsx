import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaKey, FaMobileAlt, FaChevronRight } from "react-icons/fa";

import Quotes from "../../../shared/components/Quotes.jsx";
import { branchService } from "../../admin/branches/services/branchService";
import { carsService } from "../../vehicles/Services/carsService";
import "./AuthShowcase.css";

// Sin página propia de descargas: va directo a GitHub Pages. Cambiar esta
// URL cuando esa página quede publicada.
const APP_DOWNLOAD_URL = "https://github.com/RentaMovil";

// Panel de marca a la izquierda del login/registro. El logo ya va en
// AuthTopbar, arriba de todo, así que este panel arranca en el badge.
function AuthShowcase() {
  const { t } = useTranslation();
  // Sucursales y vehículos disponibles: datos reales, no inventados. Ambos
  // endpoints son públicos (no requieren sesión), igual que el catálogo.
  const [branchCount, setBranchCount] = useState(null);
  const [availableCount, setAvailableCount] = useState(null);

  useEffect(() => {
    let active = true;

    branchService.getAll()
      .then((branches) => { if (active) setBranchCount(branches.length); })
      .catch(() => {});

    carsService.getAll()
      .then((vehicles) => { if (active) setAvailableCount(vehicles.length); })
      .catch(() => {});

    return () => { active = false; };
  }, []);

  return (
    <aside className="auth-showcase">
      <div className="auth-showcase-top">
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
            <span className="auth-showcase-stat-value">{branchCount ?? "–"}</span>
            <span className="auth-showcase-stat-label">{t("authShowcase.stat1Label")}</span>
          </div>
          <div className="auth-showcase-stat">
            <span className="auth-showcase-stat-value">{availableCount ?? "–"}</span>
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
        <a
          href={APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="auth-showcase-app-link"
        >
          <span className="auth-showcase-app-link-icon"><FaMobileAlt /></span>
          <div className="auth-showcase-app-link-text">
            <strong>{t("authShowcase.getApp")}</strong>
            <p>{t("authShowcase.getAppDesc")}</p>
          </div>
          <FaChevronRight />
        </a>

        <div className="auth-showcase-quote">
          <Quotes />
        </div>
      </div>
    </aside>
  );
}

export default AuthShowcase;
