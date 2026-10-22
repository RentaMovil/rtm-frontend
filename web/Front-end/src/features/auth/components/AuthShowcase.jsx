import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaKey, FaMobileAlt, FaChevronRight } from "react-icons/fa";

import Quotes from "../../../shared/components/Quotes.jsx";
import { branchService } from "../../admin/branches/services/branchService";
import { carsService } from "../../vehicles/Services/carsService";
import "./AuthShowcase.css";

const APP_DOWNLOAD_URL = "https://github.com/RentaMovil/rtm-frontend/releases/download/v1.0.5/application-19cfacab-b35a-4c91-b9d1-045108996c86.apk";

function AuthShowcase() {
  const { t } = useTranslation();
  const [branchCount, setBranchCount] = useState(null);
  const [availableCount, setAvailableCount] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async (e) => {
    e.preventDefault(); 
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      
      const response = await fetch(APP_DOWNLOAD_URL);
      if (!response.ok) throw new Error("Failed to download the file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "RentaMovil.apk"; 
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading the APK:", error);
      window.location.href = APP_DOWNLOAD_URL;
    } finally {
      setIsDownloading(false);
    }
  };

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
          onClick={handleDownload}
          className={`auth-showcase-app-link ${isDownloading ? "downloading" : ""}`}
          style={{ cursor: isDownloading ? "wait" : "pointer" }}
        >
          <span className="auth-showcase-app-link-icon"><FaMobileAlt /></span>
          <div className="auth-showcase-app-link-text">
            <strong>
              {isDownloading
                ? t("authShowcase.downloadingApp")
                : t("authShowcase.getApp")}
            </strong>
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
