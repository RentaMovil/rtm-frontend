import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaMobileAlt, FaTimes } from "react-icons/fa";

import "./MobileAppBanner.css";

const APP_DOWNLOAD_URL = "https://github.com/RentaMovil/rtm-frontend/releases/download/v1.0.13/RentaMovil.apk";
const DISMISS_KEY = "mobileAppBannerDismissed";

// Visitante en navegador de celular (no un desktop angosto): mejor
// experiencia es la app nativa, no esta web adaptada. User-Agent, no ancho de
// pantalla, para no mostrarlo en una ventana de escritorio redimensionada.
function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function MobileAppBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isMobileBrowser() && !localStorage.getItem(DISMISS_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="mobile-app-banner">
      <span className="mobile-app-banner-text">
        <FaMobileAlt /> {t("mobileAppBanner.title")}
      </span>

      <a className="mobile-app-banner-link" href={APP_DOWNLOAD_URL}>
        {t("mobileAppBanner.download")}
      </a>

      <button
        type="button"
        className="mobile-app-banner-close"
        onClick={dismiss}
        aria-label={t("mobileAppBanner.close")}
      >
        <FaTimes />
      </button>
    </div>
  );
}
