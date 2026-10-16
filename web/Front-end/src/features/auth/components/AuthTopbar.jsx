import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaMoon, FaSun, FaGlobe, FaCheck } from "react-icons/fa";

import LogoCar from "../../../shared/components/layout/LogoCar.jsx";
import "./AuthTopbar.css";

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
];

// Mismo estado de tema que maneja App.jsx (localStorage "theme", clase en
// <html>); aquí solo se alterna entre skylight (claro) y dark, el selector
// completo de los 4 temas vive en /account.
function AuthTopbar({ isLoginMode, onSelectMode, theme, setTheme }) {
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "skylight" : "dark");

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const currentLang = i18n.language?.slice(0, 2) || "es";

  useEffect(() => {
    if (!langOpen) return;
    const onClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langOpen]);

  const selectLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    setLangOpen(false);
  };

  return (
    <header className="auth-topbar">
      <div className="auth-topbar-logo">
        <span className="auth-topbar-logo-text">Renta<span>Movil</span></span>
        <LogoCar className="auth-topbar-logo-icon" />
      </div>

      <div className="auth-topbar-actions">
        <div className="auth-topbar-lang" ref={langRef}>
          <button
            type="button"
            className="auth-topbar-lang-trigger"
            onClick={() => setLangOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            <FaGlobe />
            <span>{currentLang.toUpperCase()}</span>
          </button>

          {langOpen && (
            <ul className="auth-topbar-lang-menu" role="listbox">
              {LANGUAGES.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={currentLang === lang.code}
                    className={`auth-topbar-lang-option ${currentLang === lang.code ? "selected" : ""}`}
                    onClick={() => selectLang(lang.code)}
                  >
                    {lang.label}
                    {currentLang === lang.code && <FaCheck />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

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
