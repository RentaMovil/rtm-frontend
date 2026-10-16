import { useTranslation } from "react-i18next";
import { FaMoon, FaSun, FaGlobe } from "react-icons/fa";

import LogoCar from "../../../shared/components/layout/LogoCar.jsx";
import "./AuthTopbar.css";

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "pt", label: "PT" },
];

// Mismo estado de tema que maneja App.jsx (localStorage "theme", clase en
// <html>); aquí solo se alterna entre skylight (claro) y dark, el selector
// completo de los 4 temas vive en /account.
function AuthTopbar({ isLoginMode, onSelectMode, theme, setTheme }) {
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "skylight" : "dark");

  const handleLangChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <header className="auth-topbar">
      <div className="auth-topbar-logo">
        <span className="auth-topbar-logo-text">Renta<span>Movil</span></span>
        <LogoCar className="auth-topbar-logo-icon" />
      </div>

      <div className="auth-topbar-actions">
        <label className="auth-topbar-lang">
          <FaGlobe />
          <select value={i18n.language?.slice(0, 2) || "es"} onChange={handleLangChange}>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="auth-topbar-theme"
          onClick={toggleTheme}
          aria-label={isDark ? t("authShowcase.lightMode") : t("authShowcase.darkMode")}
          title={isDark ? t("authShowcase.lightMode") : t("authShowcase.darkMode")}
        >
          {isDark ? <FaSun /> : <FaMoon />}
        </button>

        <div className="auth-topbar-buttons">
          <button
            type="button"
            className={`auth-topbar-btn ${isLoginMode ? "active" : ""}`}
            onClick={() => onSelectMode(true)}
          >
            {t("loginForm.submit")}
          </button>
          <button
            type="button"
            className={`auth-topbar-btn ${!isLoginMode ? "active" : ""}`}
            onClick={() => onSelectMode(false)}
          >
            {t("register.submit")}
          </button>
        </div>
      </div>
    </header>
  );
}

export default AuthTopbar;
