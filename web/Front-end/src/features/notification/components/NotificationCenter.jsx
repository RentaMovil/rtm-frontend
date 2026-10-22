import React from "react";
import { FaEnvelopeOpen } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ButtonBack from "../../../shared/components/buttonBack.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import { useNotificationRealtime } from "../context/NotificationRealtimeContext.jsx";
import { getNotificationStatus, NOTIFICATION_TYPES } from "../utils/notificationsUtils.js";

const filterTranslationKeys = {
  reserva_confirmada: "confReservations",
  pago_confirmado: "pays",
  reserva_cancelada: "cancel",
  recordatorio: "recordatory",
};

function NotificationCenter({ onBack }) {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    selectedNotification,
    filter,
    isLoading,
    error,
    setFilter,
    setSelectedNotification,
    openNotification,
  } = useNotifications();
  const { refreshUnreadCount } = useNotificationRealtime();

  const filters = ["todos", ...NOTIFICATION_TYPES];

  return (
    <div className="notification-page">
      <div className="main-layout">
        {/* Sección Lateral de Filtros */}
        <div className="filter-section">
          <div className="header-page">
            <ButtonBack onClick={onBack} variant="normal" />
          </div>

          {filters.map((type) => (
            <button
              type="button"
              key={type}
              className={`filter-item ${filter === type ? "active" : ""}`}
              onClick={() => setFilter(type)}
            >
              {type === "todos" ? (
                <span className="filter-content-wrapper">
                  {t("notifications.all")}
                  {unreadCount > 0 && (
                    <span className="unread-badge-counter">{unreadCount}</span>
                  )}
                </span>
              ) : (
                t(`notifications.${filterTranslationKeys[type]}`)
              )}
            </button>
          ))}
        </div>

        {/* Separador Vertical */}
        <div className="line-vertical" />

        {/* Lista de Notificaciones */}
        <div className="content">
          <div className="notifications-container">
            <h3>{t("notifications.recibed")}</h3>

            {isLoading && (
              <p className="notification-feedback">{t("notifications.loading")}</p>
            )}

            {error && (
              <p className="notification-feedback">{error}</p>
            )}

            {!isLoading && !error && notifications.length === 0 && (
              <p className="notification-feedback">
                {t("notifications.emptyFilter")}
              </p>
            )}

            {!isLoading &&
              !error &&
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.notification_id}
                  className={`notification ${
                    !notification.is_read ? "unread" : ""
                  }`}
                  onClick={async () => {
                    await openNotification(notification);
                    refreshUnreadCount();
                  }}
                >
                  <span className="icon-btn">
                    <FaEnvelopeOpen />
                  </span>
                  <span>
                    <span className="text">{notification.message}</span>
                    <small className="text">
                      {new Date(notification.sent_date).toLocaleString()}
                    </small>
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedNotification && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="modal-title">{t("notifications.detail")}</h3>

            <div className="invoice">
              <div className="invoice-row">
                <span className="label">{t("notifications.message")}</span>
                <span className="value">{selectedNotification.message}</span>
              </div>

              <div className="invoice-row">
                <span className="label">{t("notifications.date")}</span>
                <span className="value">
                  {new Date(selectedNotification.sent_date).toLocaleString()}
                </span>
              </div>

              <div className="invoice-row">
                <span className="label">{t("notifications.state")}</span>
                <span className="value">
                  {getNotificationStatus(selectedNotification.type)}
                </span>
              </div>

              {selectedNotification.vehicle && (
                <div className="invoice-row">
                  <span className="label">{t("notifications.vehicle")}</span>
                  <span className="value">
                    {selectedNotification.vehicle.name} ·{" "}
                    {selectedNotification.vehicle.model}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal"
                onClick={() => setSelectedNotification(null)}
              >
                {t("notifications.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
