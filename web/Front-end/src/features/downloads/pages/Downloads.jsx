import { useTranslation } from "react-i18next";
import { FaAndroid, FaApple, FaDownload } from "react-icons/fa";
import { Link } from "react-router-dom";

import LogoCar from "../../../shared/components/layout/LogoCar.jsx";
import "./Downloads.css";

const APK_URL = "https://rentamovil.tech/downloads/RentaMovil.apk";
// api.qrserver.com: mismo patron que flagcdn.com en AuthTopbar, servicio
// externo gratuito en vez de sumar una libreria de QR al bundle.
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(APK_URL)}`;

function Downloads() {
  const { t } = useTranslation();

  return (
    <div className="downloads-page">
      <Link to="/" className="downloads-logo">
        <span className="downloads-logo-text">Renta<span>Movil</span></span>
        <LogoCar className="downloads-logo-icon" />
      </Link>

      <h1 className="downloads-title">{t("downloads.title")}</h1>
      <p className="downloads-subtitle">{t("downloads.subtitle")}</p>

      <div className="downloads-cards">
        <div className="downloads-card">
          <div className="downloads-card-icon"><FaAndroid /></div>
          <h2>{t("downloads.androidTitle")}</h2>
          <p>{t("downloads.androidDesc")}</p>

          <img className="downloads-qr" src={QR_URL} alt={t("downloads.qrAlt")} />

          <a className="downloads-btn" href={APK_URL} download="RentaMovil.apk">
            <FaDownload /> {t("downloads.androidButton")}
          </a>

          <p className="downloads-hint">{t("downloads.androidHint")}</p>
        </div>

        <div className="downloads-card downloads-card-disabled">
          <div className="downloads-card-icon"><FaApple /></div>
          <h2>{t("downloads.iosTitle")}</h2>
          <p>{t("downloads.iosDesc")}</p>
          <span className="downloads-badge">{t("downloads.comingSoon")}</span>
        </div>
      </div>

      <Link to="/" className="downloads-back">{t("downloads.back")}</Link>
    </div>
  );
}

export default Downloads;
