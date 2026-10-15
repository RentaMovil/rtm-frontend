import { useState } from "react";
import "./HistorialReservation.css";
import { RoleNavbar, RoleFooter } from "../../../shared/components/layout/RoleChrome.jsx";
import ReservationDetailModal from "../components/HistoryReservationDetail.jsx";
import { useTranslation } from "react-i18next";
import { useReservationsList } from "../hooks/useReservationsList.js";
import { useCancelReservation } from "../hooks/useCancelReservation.js";
import { useUpdateReturnBranch } from "../hooks/useUpdateReturnBranch.js";
import { useBranches } from "../../admin/branches/hooks/useBranch.js";
import PaymentCountdown from "../components/PaymentCountdown.jsx";
import UploadReceiptModal from "../components/UploadReceiptModal.jsx";
function HistorialReservation() {
  const { t } = useTranslation();

  const { user } = useAuth();
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);
  const NavbarComponent = isAdmin ? NavbarAdmin : Navbar;
  const FooterComponent = isAdmin ? FooterAdmin : Footer;

  const { reservations: reservas, isLoading, error, refetch } = useReservationsList();
  const { cancelReservation } = useCancelReservation();
  const { updateReturnBranch } = useUpdateReturnBranch();
  const { branches } = useBranches();
  const getBranchById = (id) => branches.find((b) => b.id === id);

  const [selectedReserva, setSelectedReserva] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [uploadReserva, setUploadReserva] = useState(null);

  const handleCancelReservation = async (id) => {
    await cancelReservation(id);
    await refetch();
    setShowCancelModal(false);
    setSelectedReserva(null);
  };

  const handleUpdateReturnBranch = async (id, returnBranchId) => {
    await updateReturnBranch(id, returnBranchId);
    await refetch();

    setSelectedReserva((prev) =>
      prev && prev.id === id ? { ...prev, returnBranchId } : prev
    );
  };

  return (
    <>
      <RoleNavbar />
      <div className="historial-page">
        <div className="cards-container">

          <h2 className="title">
            {t("historyReservation.myReservations", "Mis Reservas")}
          </h2>

          {isLoading && <p className="title">Cargando reservas...</p>}
          {!isLoading && error && <p className="title">{error}</p>}

          {/* Estado vacío: un array vacío no renderiza nada y deja la página en blanco */}
          {!isLoading && !error && !reservas.length && (
            <div className="historial-empty">
              <p>{t("historyReservation.emptyTitle", "No hay reservas que coincidan con estos filtros.")}</p>
            </div>
          )}

          {!isLoading && !error && reservas.map((r) => {
            const pickUpBranch = getBranchById(r.pickupBranchId);
            const returnBranch = getBranchById(r.returnBranchId);

            return (
            <article key={r.id} className="reserva-card">

              {/* Barra superior de metadatos de la reserva */}
              <header className="reserva-header">
                <div className="reserva-meta">
                  <span className="reserva-id">#{r.id}</span>
                  <span className="reserva-creada">
                    {t("historyReservation.created", "Creada el")} {r.created_at}
                  </span>
                </div>
                <span className={`reserva-badge estado-${r.status}`}>
                  {t(`historyReservation.status.${r.status}`, r.status)}
                </span>
              </header>

              {/* El contenedor del cuerpo de la tarjeta */}
              <div className="reserva-body">

                {/* COLUMNA 1: Vehículo */}
                <section className="reserva-vehiculo">
                  <div className="vehiculo-imagen-wrapper">
                    <img src={r.vehicle.img} alt={`${r.vehicle.brand} ${r.vehicle.model}`} />
                    <span className="vehiculo-placa">{r.vehicle.plate}</span>
                  </div>

                  <div className="vehiculo-info">
                    <span className="vehiculo-categoria">{r.vehicle.category?.toUpperCase()}</span>
                    <h4 className="titulo-card">{r.vehicle.brand} {r.vehicle.model}</h4>
                    <div className="vehiculo-specs">
                      <span>⚙️ {r.vehicle.transmission}</span>
                      <span>👥 {r.vehicle.seats} {t("historyReservation.seats", "Pasajeros")}</span>
                    </div>
                  </div>
                </section>

                {/* COLUMNA 2: Fechas y Duración (Estilo pasaje/ticket) */}
                <section className="reserva-tiempos">
                  <div className="tiempo-bloque">
                    <span className="tiempo-label">{t("historyReservation.pickup", "ENTREGA")}</span>
                    <span className="tiempo-fecha">{r.tiempos.start_date.split(' ').slice(0, 3).join(' ')}</span>
                    <span className="tiempo-hora">{r.tiempos.start_date.split(' ').slice(3).join(' ')}</span>
                  </div>

                  <div className="tiempo-bloque">
                    <span className="tiempo-label">{t("historyReservation.return", "DEVOLUCIÓN")}</span>
                    <span className="tiempo-fecha">{r.tiempos.end_date.split(' ').slice(0, 3).join(' ')}</span>
                    <span className="tiempo-hora">{r.tiempos.end_date.split(' ').slice(3).join(' ')}</span>
                  </div>

                  <div className="tiempo-duracion">
                    <span className="tiempo-label">{t("historyReservation.duration", "Duración:")}</span>
                    <span className="badge-duracion">{r.tiempos.days} {t("historyReservation.days", "Días")}</span>
                  </div>
                </section>

                {/* COLUMNA 3: Precios y BOTONES */}
                <section className="reserva-acciones">
                  <div className="facturacion-resumen">
                    <span className="facturacion-label">{t("historyReservation.totalAmount", "MONTO FACTURADO")}</span>
                    <div className="facturacion-precio">
                      <span className="precio-monto">${r.billing.total_price.toLocaleString()}</span>
                      <span className="precio-moneda">{r.currency}</span>
                    </div>
                    {r.billing.insurance_included && (
                      <span className="facturacion-cobertura">✓ {t("historyReservation.insuranceIncluded", "Cobertura incluida")}</span>
                    )}
                  </div>

                  <div className="acciones-botones">
                    <button
                      className="btn btn-primario"
                      onClick={() => {
                        setSelectedReserva(r);
                        setShowDetailsModal(true);
                      }}
                    >
                      {t("historyReservation.details", "Ver Detalles")}
                    </button>

                    {/* INV-004: solo reservas vigentes, hasta 3 días antes de la recogida */}
                    {r.canCancel && (
                      <button
                        className="btn btn-secundario"
                        onClick={() => {
                          setSelectedReserva(r);
                          setShowCancelModal(true);
                        }}
                      >
                        {t("historyReservation.cancel", "Cancelar Reserva")}
                      </button>
                    )}
                  </div>

                  {/* "Reservar y pagar después": sin comprobante todavía, con la ventana de
                      INV-015 corriendo. Ya subido, el admin la revisa (PENDING_REVIEW) y aquí
                      no hay nada más que hacer hasta que decida. */}
                  {r.backendStatus === "PENDING_PAYMENT" && (
                    <div className="reserva-pago-pendiente">
                      <button
                        type="button"
                        className="btn btn-primario"
                        onClick={() => setUploadReserva(r)}
                      >
                        {t("historyReservation.uploadReceipt", "Subir comprobante")}
                      </button>
                      <PaymentCountdown createdAt={r.created_at} />
                    </div>
                  )}
                  {r.backendStatus === "PENDING_REVIEW" && (
                    <p className="reserva-en-revision">
                      {t("historyReservation.inReview", "Comprobante en revisión por un administrador.")}
                    </p>
                  )}
                </section>

              </div>
            </article>
            );
          })}
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
      {showCancelModal && selectedReserva && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>
              {t("historyReservation.sure", "¿Deseas cancelar la reserva del vehículo?")}{" "}
              <strong>{selectedReserva.vehicle.brand} {selectedReserva.vehicle.model}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn-negative" onClick={() => setShowCancelModal(false)}>
                {t("historyReservation.no", "No")}
              </button>
              <button className="btn-danger" onClick={() => handleCancelReservation(selectedReserva.id)}>
                {t("historyReservation.yes", "Sí, Cancelar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENTE MODAL DE DESGLOSE FINANCIERO */}
      <ReservationDetailModal
        isOpen={showDetailsModal}
        reserva={selectedReserva}
        onClose={() => setShowDetailsModal(false)}
        onUpdateReturnBranch={handleUpdateReturnBranch}
      />

      <RoleFooter />
    </>
  );
}

export default HistorialReservation;