import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiArrowLeft, FiPrinter, FiAlertCircle, FiXCircle, FiCheckCircle, FiX,
  FiMapPin, FiClock, FiCreditCard, FiFileText, FiZoomIn, FiExternalLink,
  FiInfo, FiKey,
} from "react-icons/fi";
import { FaCar, FaSatelliteDish } from "react-icons/fa";
import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { useReservationsAdmin } from "../../../booking/hooks/useReservationAdmin";
import { paymentService } from "../../../payment/services/paymentService";
import { toRejectOutcome } from "../../../payment/services/paymentMapper";
import { rentalService } from "../../../booking/services/rentalService";
import { useGps } from "../../vehicleLocation/hooks/useGps";
import { useDialog } from "../../../../shared/components/dialog/dialogContext";
import { getTotal, getDisplayStatus, statusMeta, formatDate, formatTime, formatMoney } from "../services/reservationHelpers";
import "./Reservations.css";
import "./ReservationDetail.css";

export default function ReservationDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();

  const { reservations, isLoading, error, refetch } = useReservationsAdmin();
  const { gpsDevices } = useGps();
  const { confirm } = useDialog();

  // El id de la URL es texto y el de booking es número
  const reservation = reservations.find((r) => String(r.id) === id);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState(false);
  const [rejectAction, setRejectAction] = useState("reupload");
  const [operationOpen, setOperationOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  const anyModalOpen = rejectOpen || operationOpen || receiptOpen;
  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyModalOpen]);

  if (isLoading) {
    return (
      <div className="rs-page">
        <NavBarAdmin />
        <div className="rs-wrapper"><p className="rd-not-found">{t("reservations.loadingDetail")}</p></div>
        <FooterAdmin />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="rs-page">
        <NavBarAdmin />
        <div className="rs-wrapper">
          <p className="rd-not-found">{error || t("reservations.notFound")}</p>
          <Link to="/reservations" className="rs-btn-outline">
            <FiArrowLeft /> {t("reservations.backToList")}
          </Link>
        </div>
        <FooterAdmin />
      </div>
    );
  }

  const meta = statusMeta(getDisplayStatus(reservation), t);
  const total = getTotal(reservation);
  const operationMode = reservation.rental?.status === "IN_PROGRESS" ? "return" : "pickup";
  const canOperate = reservation.status === "CONFIRMED";
  const trackingAvailable = !!reservation.rental;
  // Un <img> no renderiza un PDF (queda el ícono roto): el comprobante puede ser imagen o PDF.
  const receiptIsPdf = reservation.payment?.receiptImageUrl?.toLowerCase().endsWith(".pdf");

  const openReject = () => {
    setRejectReason("");
    setRejectReasonError(false);
    setRejectAction("reupload");
    setActionError(null);
    setRejectOpen(true);
  };
  const closeReject = () => setRejectOpen(false);

  const confirmApprove = async () => {
    const confirmed = await confirm({ message: t("reservations.confirmApprove") });
    if (!confirmed) return;

    setActionError(null);
    try {
      // El revisor sale del JWT en payment-billing, no se manda en el cuerpo. Aprobar genera
      // la factura y avisa a booking, que confirma la reserva por su cuenta (-> CONFIRMED).
      await paymentService.approve(reservation.payment.id);
      await refetch();
    } catch (err) {
      setActionError(err.message || t("reservations.approveError"));
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectReasonError(true);
      return;
    }
    setActionError(null);
    try {
      // rejectAction ("reupload"/"cancel") -> outcome (RETRY_ALLOWED/RESERVATION_CANCELLED):
      // booking pasa la reserva a PENDING_PAYMENT o CANCELLED según lo que decida el Admin aquí.
      await paymentService.reject(
        reservation.payment.id,
        rejectReason.trim(),
        toRejectOutcome(rejectAction)
      );
      await refetch();
      closeReject();
    } catch (err) {
      setActionError(err.message || t("reservations.rejectError"));
    }
  };

  const openOperation = () => setOperationOpen(true);
  const closeOperation = () => setOperationOpen(false);

  const handleOperationSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const mileage = Number(data.get("mileage"));
    setActionError(null);

    try {
      if (operationMode === "pickup") {
        const gpsId = data.get("gps");
        await rentalService.createPickup(reservation.id, gpsId, mileage);
      } else {
        // Booking cierra la renta y pasa la reserva a COMPLETED en la misma operación
        await rentalService.registerReturn(reservation.rental.id, mileage);
      }
      await refetch();
      closeOperation();
    } catch (err) {
      setActionError(err.message || t("reservations.operationError"));
    }
  };

  return (
    <div className="rs-page">
      <NavBarAdmin />

      <div className="rs-wrapper rd-wrapper">
        <div className="rd-top">
          <div>
            <div className="rd-title-row">
              <h1 className="rd-title">{t("reservations.detailTitle", { id: reservation.id })}</h1>
              <span className={`rs-status-badge ${meta.className}`}>
                <span className="rs-status-dot" />
                {meta.label}
              </span>
            </div>
            <p className="rd-description">{t(`reservations.description.${getDisplayStatus(reservation)}`)}</p>
          </div>

          <div className="rd-header-actions">
            <Link to="/reservations" className="rs-btn-outline">
              <FiArrowLeft /> {t("reservations.backToList")}
            </Link>
            <button type="button" className="rs-btn-outline" onClick={() => window.print()}>
              <FiPrinter /> {t("reservations.print")}
            </button>
          </div>
        </div>

        {actionError && (
          <p className="rd-error-message" style={{ marginBottom: '1rem' }}>
            <FiAlertCircle /> {actionError}
          </p>
        )}

        {reservation.status === "PENDING_REVIEW" && (
          <div className="rd-action-bar">
            <div className="rd-action-bar-info">
              <span className="rd-action-bar-icon"><FiAlertCircle /></span>
              <div>
                <h3>{t("reservations.actionBarTitle")}</h3>
                <p>{t("reservations.actionBarText", { amount: formatMoney(reservation.payment.amount) })}</p>
              </div>
            </div>
            <div className="rd-action-bar-buttons">
              <button type="button" className="rd-btn-reject" onClick={openReject}>
                <FiXCircle /> {t("reservations.rejectPayment")}
              </button>
              <button type="button" className="rd-btn-approve" onClick={confirmApprove}>
                <FiCheckCircle /> {t("reservations.approvePayment")}
              </button>
            </div>
          </div>
        )}

        <div className="rd-grid">
          <div className="rd-col-left">
            <div className="rd-card">
              <div className="rd-card-header">
                <span className="rd-eyebrow">{t("reservations.vehicleSection")}</span>
              </div>
              <div className="rd-vehicle-row">
                <div className="rd-vehicle-photo"><FaCar /></div>
                <div className="rd-vehicle-info">
                  <div className="rd-vehicle-name">
                    <h2>{reservation.vehicle.name}</h2>
                    <span className="rd-plate">{reservation.vehicle.plate}</span>
                  </div>
                  <p className="rd-vehicle-specs">
                    {reservation.vehicle.category} • {reservation.vehicle.fuel} •{" "}
                    {t("reservations.seats", { count: reservation.vehicle.seats })}
                  </p>
                  <div className="rd-vehicle-tags">
                    <span>{t("reservations.mileage", { km: reservation.vehicle.mileage.toLocaleString("es-CO") })}</span>
                  </div>
                </div>
              </div>

              <div className="rd-customer-strip">
                <div className="rd-customer-id">
                  <div className="rd-avatar">
                    {reservation.customer.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <p className="rd-customer-name">{reservation.customer.name}</p>
                    <p className="rd-customer-contact">
                      {reservation.customer.email}
                      {reservation.customer.phone && ` • ${reservation.customer.phone}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rd-card">
              <span className="rd-eyebrow block">{t("reservations.itinerarySection")}</span>
              <div className="rd-itinerary-grid">
                <div className="rd-itinerary-box">
                  <div className="rd-itinerary-label pickup"><FiClock /> {t("reservations.pickupLabel")}</div>
                  <p className="rd-itinerary-date">
                    {formatDate(reservation.pickup.date, i18n.language)} — {formatTime(reservation.pickup.date, i18n.language)}
                  </p>
                  <div className="rd-itinerary-address">
                    <FiMapPin />
                    <span><strong>{reservation.pickup.branchName}:</strong> {reservation.pickup.branchAddress}</span>
                  </div>
                </div>
                <div className="rd-itinerary-box">
                  <div className="rd-itinerary-label dropoff"><FiClock /> {t("reservations.dropoffLabelFull")}</div>
                  <p className="rd-itinerary-date">
                    {formatDate(reservation.dropoff.date, i18n.language)} — {formatTime(reservation.dropoff.date, i18n.language)}
                  </p>
                  <div className="rd-itinerary-address">
                    <FiMapPin />
                    <span><strong>{reservation.dropoff.branchName}:</strong> {reservation.dropoff.branchAddress}</span>
                  </div>
                </div>
              </div>
              <div className="rd-duration-banner">
                <span><FiClock /> {t("reservations.durationBanner", { count: reservation.durationDays })}</span>
                <span className="strong">
                  {reservation.pickup.branchName === reservation.dropoff.branchName
                    ? t("reservations.sameBranch")
                    : t("reservations.differentBranch")}
                </span>
              </div>
            </div>

            <div className="rd-card">
              <span className="rd-eyebrow block">{t("reservations.billingSection")}</span>
              <div className="rd-billing-list">
                <div className="rd-billing-row">
                  <span>
                    {t("reservations.billingRental", {
                      name: reservation.vehicle.name,
                      days: reservation.durationDays,
                      rate: (reservation.rentalSubtotal / reservation.durationDays).toLocaleString("es-CO"),
                    })}
                  </span>
                  <span className="strong">{formatMoney(reservation.rentalSubtotal)}</span>
                </div>
                <div className="rd-billing-row">
                  <span>
                    {reservation.insurance.name} <span className="rd-pill">{t("reservations.included")}</span>
                  </span>
                  <span className="strong">{formatMoney(reservation.insurance.amount)}</span>
                </div>
                <div className="rd-billing-total">
                  <div>
                    <span className="label">{t("reservations.total")}</span>
                  </div>
                  <span className="amount">{formatMoney(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rd-col-right">
            <div className="rd-card">
              <div className="rd-card-header">
                <span className="rd-eyebrow icon"><FiCreditCard /> {t("reservations.paymentSection")}</span>
                <span className={`rs-status-badge ${meta.className}`}>
                  <span className="rs-status-dot" />
                  {meta.label}
                </span>
              </div>

              {!reservation.payment ? (
                <div className="rd-empty-payment">
                  <FiInfo />
                  <p>{t("reservations.awaitingReceipt")}</p>
                </div>
              ) : (
                <>
                  <div className="rd-payment-grid">
                    <div className="rd-payment-item">
                      <span>{t("reservations.amountTransferred")}</span>
                      <strong>{formatMoney(reservation.payment.amount)}</strong>
                    </div>
                    <div className="rd-payment-item">
                      <span>{t("reservations.bankEntity")}</span>
                      <strong>{reservation.payment.bank}</strong>
                    </div>
                    <div className="rd-payment-item">
                      <span>{t("reservations.reference")}</span>
                      <strong className="mono">{reservation.payment.reference}</strong>
                    </div>
                    <div className="rd-payment-item">
                      <span>{t("reservations.receiptDateTime")}</span>
                      <strong>
                        {formatDate(reservation.payment.receivedAt, i18n.language)}, {formatTime(reservation.payment.receivedAt, i18n.language)}
                      </strong>
                    </div>
                  </div>

                  {reservation.payment.rejectionReason && (
                    <div className="rd-rejection-box">
                      <FiAlertCircle />
                      <div>
                        <strong>{t("reservations.rejectionReasonLabel")}</strong>
                        <p>{reservation.payment.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="rd-receipt-head">
                      <label><FiFileText /> {t("reservations.receiptLabel")}</label>
                      <button type="button" className="rd-link-btn" onClick={() => setReceiptOpen(true)}>
                        <FiZoomIn /> {t("reservations.enlarge")}
                      </button>
                    </div>
                    <div className="rd-receipt-preview" onClick={() => setReceiptOpen(true)}>
                      {receiptIsPdf ? (
                        <div className="rd-receipt-pdf-badge">
                          <FiFileText /> PDF
                        </div>
                      ) : (
                        <img src={reservation.payment.receiptImageUrl} alt={t("reservations.receiptLabel")} />
                      )}
                    </div>
                    <p className="rd-receipt-caption">
                      {t("reservations.uploadedBy", { name: reservation.payment.uploadedBy })}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="rd-card">
              <div className="rd-card-header">
                <span className="rd-eyebrow">{t("reservations.operationSection")}</span>
              </div>

              {reservation.status === "PENDING_PAYMENT" || reservation.status === "PENDING_REVIEW" ? (
                <p className="rd-operation-muted">{t("reservations.operationLockedPayment")}</p>
              ) : reservation.status === "CANCELLED" ? (
                <p className="rd-operation-muted">{t("reservations.operationCancelled")}</p>
              ) : (
                <>
                  {canOperate && (
                    <button type="button" className="rd-btn-primary" onClick={openOperation}>
                      <FiKey />
                      {operationMode === "pickup" ? t("reservations.registerPickup") : t("reservations.registerReturn")}
                    </button>
                  )}
                  {canOperate && (
                    <p className="rd-operation-hint">
                      {operationMode === "pickup" ? t("reservations.pickupHint") : t("reservations.returnHint")}
                    </p>
                  )}
                  {reservation.status === "COMPLETED" && (
                    <div className="rd-completed-strip">
                      <FiCheckCircle />
                      {t("reservations.completedStrip", { date: formatDate(reservation.rental.returnAt, i18n.language) })}
                    </div>
                  )}

                  {trackingAvailable && (
                    <Link className="rd-tracking-row" to="/VehicleLocation">
                      <span className="rd-tracking-label">
                        <span className="rd-tracking-icon"><FiMapPin /></span>
                        {t("reservations.viewTracking")}
                      </span>
                      {reservation.rental.status === "IN_PROGRESS" && (
                        <span className="rd-tracking-badge">
                          <FaSatelliteDish /> {t("reservations.gpsOnline")}
                        </span>
                      )}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterAdmin />

      {rejectOpen && (
        <div className="rd-modal-overlay" onClick={closeReject}>
          <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rd-modal-header reject">
              <h3><FiAlertCircle /> {t("reservations.rejectModal.title")}</h3>
              <button type="button" className="rd-modal-close" onClick={closeReject}><FiX /></button>
            </div>
            <div className="rd-modal-form">
              <label className="rd-field">
                {t("reservations.rejectModal.reason")}
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); if (rejectReasonError) setRejectReasonError(false); }}
                  placeholder={t("reservations.rejectModal.reasonPlaceholder")}
                />
                {rejectReasonError && (
                  <p className="rd-error-message"><FiAlertCircle /> {t("reservations.rejectModal.reasonError")}</p>
                )}
              </label>

              <div className="rd-radio-group">
                <span className="rd-field-label">{t("reservations.rejectModal.actionLabel")}</span>
                <label className={`rd-radio-option ${rejectAction === "reupload" ? "active" : ""}`}>
                  <input type="radio" checked={rejectAction === "reupload"} onChange={() => setRejectAction("reupload")} />
                  <div>
                    <strong>{t("reservations.rejectModal.reuploadTitle")}</strong>
                    <p>{t("reservations.rejectModal.reuploadText")}</p>
                  </div>
                </label>
                <label className={`rd-radio-option ${rejectAction === "cancel" ? "active" : ""}`}>
                  <input type="radio" checked={rejectAction === "cancel"} onChange={() => setRejectAction("cancel")} />
                  <div>
                    <strong>{t("reservations.rejectModal.cancelTitle")}</strong>
                    <p>{t("reservations.rejectModal.cancelText")}</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="rd-modal-footer">
              <button type="button" className="rd-btn-secondary" onClick={closeReject}>{t("reservations.cancel")}</button>
              <button type="button" className="rd-btn-reject solid" onClick={confirmReject}>{t("reservations.rejectModal.confirm")}</button>
            </div>
          </div>
        </div>
      )}

      {operationOpen && (
        <div className="rd-modal-overlay" onClick={closeOperation}>
          <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rd-modal-header pickup">
              <h3>
                <FiKey /> {operationMode === "pickup" ? t("reservations.pickupModal.title") : t("reservations.pickupModal.titleReturn")}
              </h3>
              <button type="button" className="rd-modal-close" onClick={closeOperation}><FiX /></button>
            </div>
            <form id="operationForm" className="rd-modal-form" onSubmit={handleOperationSubmit}>
              <div className="rd-vehicle-compact">
                <div>
                  <strong>{reservation.vehicle.name}</strong>
                  <span>{operationMode === "pickup" ? reservation.pickup.branchName : reservation.dropoff.branchName}</span>
                </div>
                <span className="mono">{reservation.vehicle.plate}</span>
              </div>

              <label className="rd-field">
                {operationMode === "pickup" ? t("reservations.pickupModal.mileageOut") : t("reservations.pickupModal.mileageIn")}
                <input
                  name="mileage"
                  type="number"
                  required
                  defaultValue={operationMode === "pickup" ? reservation.vehicle.mileage : reservation.rental?.pickupMileage}
                />
              </label>

              {operationMode === "pickup" ? (
                <div className="rd-gps-box">
                  <div className="rd-gps-head"><span><FaSatelliteDish /> {t("reservations.pickupModal.gpsDevice")}</span></div>
                  <select name="gps" defaultValue={gpsDevices[0]?.id}>
                    {gpsDevices.map((g) => (
                      <option key={g.id} value={g.id}>{g.serial} ({g.model})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="rd-gps-box readonly">
                  <FaSatelliteDish />
                  {t("reservations.pickupModal.gpsAssigned", { device: reservation.rental?.gpsDevice })}
                </div>
              )}
            </form>
            <div className="rd-modal-footer">
              <button type="button" className="rd-btn-secondary" onClick={closeOperation}>{t("reservations.cancel")}</button>
              <button type="submit" form="operationForm" className="rd-btn-primary small">
                {operationMode === "pickup" ? t("reservations.pickupModal.confirmPickup") : t("reservations.pickupModal.confirmReturn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptOpen && reservation.payment && (
        <div className="rd-modal-overlay" onClick={() => setReceiptOpen(false)}>
          <div className="rd-modal rd-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="rd-modal-header">
              <div>
                <h3>{t("reservations.receiptModal.title")}</h3>
                <p className="rd-modal-subtitle">
                  {t("reservations.receiptModal.subtitle", { reference: reservation.payment.reference })}
                </p>
              </div>
              <div className="rd-modal-header-actions">
                <a href={reservation.payment.receiptImageUrl} target="_blank" rel="noreferrer"><FiExternalLink /></a>
                <button type="button" className="rd-modal-close" onClick={() => setReceiptOpen(false)}><FiX /></button>
              </div>
            </div>
            <div className="rd-receipt-full">
              {receiptIsPdf ? (
                <iframe
                  src={reservation.payment.receiptImageUrl}
                  title={t("reservations.receiptLabel")}
                  className="rd-receipt-pdf-frame"
                />
              ) : (
                <img src={reservation.payment.receiptImageUrl} alt={t("reservations.receiptLabel")} />
              )}
            </div>
            {reservation.status === "PENDING_REVIEW" && (
              <div className="rd-modal-footer">
                <button type="button" className="rd-btn-reject" onClick={() => { setReceiptOpen(false); openReject(); }}>
                  <FiXCircle /> {t("reservations.rejectPayment")}
                </button>
                <button type="button" className="rd-btn-approve" onClick={() => { setReceiptOpen(false); confirmApprove(); }}>
                  <FiCheckCircle /> {t("reservations.approvePayment")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}