import { Component } from "react";
import { withTranslation } from "react-i18next";

// React solo soporta error boundaries como class component (getDerivedStateFromError /
// componentDidCatch no existen como hook). Estilos inline a propósito: si algo rompió el
// render, no queremos depender de un CSS que pudo romperse junto con el resto del árbol.
class ErrorBoundaryBase extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            padding: "24px",
            textAlign: "center",
            gap: "12px",
          }}
        >
          <h2 style={{ margin: 0 }}>{t("errorBoundary.title")}</h2>
          <p style={{ margin: 0, color: "#666", maxWidth: "420px" }}>
            {t("errorBoundary.message")}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#facc15",
              color: "#1a1a1a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("errorBoundary.reload")}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundaryBase);
