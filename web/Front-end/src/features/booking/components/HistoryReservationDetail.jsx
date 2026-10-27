import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaBuilding, FaPen, FaCheckCircle } from "react-icons/fa";
import "./HistoryReservationDetail.css";
import { useBranches } from "../../admin/branches/hooks/useBranch";
// INV-013 (src/types/reservation.ts — Reservation.returnBranchId):
// la sucursal de devolución solo puede modificarse hasta 3 días
// antes de la fecha de devolución.
const MIN_DAYS_BEFORE_RETURN_TO_EDIT = 3;

function ReservationDetailModal({ isOpen, reserva, onClose, onUpdateReturnBranch }) {
    const { t } = useTranslation();

    const { branches } = useBranches();
    const [isEditingReturnBranch, setIsEditingReturnBranch] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const [selectedReturnBranchId, setSelectedReturnBranchId] = useState(
        reserva?.returnBranchId || ""
    );

    const getBranchById = (id) => branches.find((b) => b.id === id);

    // Mantener seleccionada la sucursal actual de devolución
    useEffect(() => {
        if (!reserva) return;

        setSelectedReturnBranchId(reserva.returnBranchId || "");
        setIsEditingReturnBranch(false);
        setSaveError(null);
    }, [reserva]);

    // La reserva solo guarda el id de cada sucursal (pickupBranchId /
    // returnBranchId); el nombre/ciudad/dirección se resuelven acá
    // contra el catálogo real de /branches.
    const pickUpBranch = reserva ? getBranchById(reserva.pickupBranchId) : null;
    const returnBranch = reserva ? getBranchById(reserva.returnBranchId) : null;

    // INV-013: ¿todavía se puede modificar la sucursal de devolución?
    const canEditReturnBranch = useMemo(() => {
        if (!reserva || reserva.status !== "activa") return false;

        const endDate = new Date(reserva.tiempos.end_date);
        if (Number.isNaN(endDate.getTime())) return false;

        const daysUntilEnd =
            (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

        return daysUntilEnd > MIN_DAYS_BEFORE_RETURN_TO_EDIT;
    // eslint-disable-next-line react-hooks/purity
    }, [reserva]);

    if (!isOpen || !reserva) return null;

    async function handleGuardarSucursal() {
        setIsSaving(true);
        setSaveError(null);

        try {
            await onUpdateReturnBranch(reserva.id, selectedReturnBranchId);
            setIsEditingReturnBranch(false);
        } catch (error) {
            setSaveError(
                error?.message ||
                t("historyReservation.updateBranchError")
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content modal-detalles"
                onClick={(e) => e.stopPropagation()}
            >

                <header className="modal-details-header">
                    <div>
                        <div className="modal-details-title-row">
                            <h3>
                                {t("historyReservation.billingDetail", "Detalle de facturación")}
                            </h3>

                            <span className={`reserva-badge estado-${reserva.status}`}>
                                {t(`historyReservation.status.${reserva.status}`, reserva.status)}
                            </span>
                        </div>

                        <p className="reserva-codigo">
                            {t("historyReservation.code", "Código de reserva:")}{" "}
                            <span className="reserva-id">{reserva.id}</span>
                        </p>
                    </div>

                    <button
                        className="btn-close-x"
                        onClick={onClose}
                        aria-label={t("historyReservation.close", "Cerrar")}
                    >
                        &times;
                    </button>
                </header>


                <div className="modal-details-body">

                    {/* Resumen Mini del Vehículo */}
                    <div className="modal-vehiculo-resumen">
                        <img
                            src={reserva.vehicle.img}
                            alt={reserva.vehicle.model}
                        />

                        <div>
                            <h4>
                                {reserva.vehicle.brand}{" "}
                                {reserva.vehicle.model}
                            </h4>

                            <p>
                                {reserva.vehicle.category}
                                <span className="dot-sep">•</span>
                                <span className="vehiculo-plate">{reserva.vehicle.plate}</span>
                            </p>

                            {reserva.billing.insurance_included && (
                                <span className="incluido-check">
                                    <FaCheckCircle />
                                    {t("historyReservation.insuranceIncluded", "Cobertura incluida")}
                                </span>
                            )}
                        </div>
                    </div>


                    {/* Sucursal de entrega (no editable) */}
                    <div className="sucursal-block">
                        <label className="sucursal-label">
                            {t("historyReservation.pickupBranch", "Sucursal de entrega")}
                        </label>

                        {pickUpBranch && (
                            <div className="sucursal-card">
                                <span className="sucursal-icon sucursal-icon-pickup">
                                    <FaMapMarkerAlt />
                                </span>

                                <div className="sucursal-text">
                                    <strong>
                                        {pickUpBranch.name} – {pickUpBranch.city}
                                    </strong>

                                    {pickUpBranch.address && (
                                        <small>{pickUpBranch.address}</small>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Sucursal de devolución — única sucursal editable, y solo
                hasta 3 días antes de la fecha de devolución (INV-013) */}
                    <div className="sucursal-block">
                        <div className="sucursal-label-row">
                            <label className="sucursal-label">
                                {t("historyReservation.returnBranch", "Sucursal de devolución")}
                            </label>

                            {!isEditingReturnBranch && canEditReturnBranch && (
                                <button
                                    type="button"
                                    className="btn-modificar-sucursal"
                                    onClick={() => setIsEditingReturnBranch(true)}
                                >
                                    <FaPen />
                                    {t("historyReservation.editBranch", "Modificar sucursal")}
                                </button>
                            )}
                        </div>

                        {!isEditingReturnBranch ? (
                            <>
                                {returnBranch && (
                                    <div className="sucursal-card">
                                        <span className="sucursal-icon sucursal-icon-return">
                                            <FaBuilding />
                                        </span>

                                        <div className="sucursal-text">
                                            <strong>
                                                {returnBranch.name} – {returnBranch.city}
                                            </strong>

                                            {returnBranch.address && (
                                                <small>{returnBranch.address}</small>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!canEditReturnBranch && reserva.status === "activa" && (
                                    <small className="sucursal-hint">
                                        {t(
                                            "historyReservation.editBranchLocked",
                                            "Ya no se puede modificar: faltan 3 días o menos para la devolución."
                                        )}
                                    </small>
                                )}
                            </>
                        ) : (
                            <div className="sucursal-edit">
                                <select
                                    value={selectedReturnBranchId}
                                    onChange={(e) => setSelectedReturnBranchId(e.target.value)}
                                    disabled={isSaving}
                                >
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name} - {branch.city}
                                        </option>
                                    ))}
                                </select>

                                {saveError && (
                                    <p className="sucursal-edit-error">{saveError}</p>
                                )}

                                <div className="sucursal-edit-actions">
                                    <button
                                        type="button"
                                        className="btn-sucursal-guardar"
                                        onClick={handleGuardarSucursal}
                                        disabled={isSaving}
                                    >
                                        {isSaving
                                            ? t("historyReservation.saving", "Guardando...")
                                            : t("historyReservation.save", "Guardar")}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-sucursal-cancelar"
                                        disabled={isSaving}
                                        onClick={() => {
                                            setSelectedReturnBranchId(reserva.returnBranchId);
                                            setSaveError(null);
                                            setIsEditingReturnBranch(false);
                                        }}
                                    >
                                        {t("historyReservation.cancelEdit", "Cancelar")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Tabla de Desglose Limpia */}
                    <div className="desglose-tabla">

                        <div className="detail-row">

                            <div className="detail-concept">

                                <span>
                                    {t("historyReservation.carRental") ||
                                        "Alquiler de vehículo"}
                                </span>

                                <small>
                                    $
                                    {reserva.billing.price_per_day.toLocaleString()}
                                    {" x "}
                                    {reserva.tiempos.days}{" "}
                                    {t("historyReservation.days") ||
                                        "días"}
                                </small>

                            </div>

                            <span className="detail-value">
                                $
                                {reserva.billing.subtotal_vehicle.toLocaleString()}
                            </span>

                        </div>


                        <div className="detail-row">

                            <div className="detail-concept">

                                <span>
                                    {t("historyReservation.insurance") ||
                                        "Seguro y coberturas integrales"}
                                </span>

                                <small>
                                    $
                                    {reserva.billing.insurance_per_day.toLocaleString()}
                                    {" x "}
                                    {reserva.tiempos.days}{" "}
                                    {t("historyReservation.days") ||
                                        "días"}
                                </small>

                            </div>

                            <span className="detail-value">
                                $
                                {reserva.billing.subtotal_insurance.toLocaleString()}
                            </span>

                        </div>


                        {/* Fila Totalizadora */}
                        <div className="detail-row total-row">

                            <span className="total-label">
                                {t("historyReservation.total") ||
                                    "Total a pagar"}:
                            </span>

                            <span className="total-value">
                                $
                                {reserva.billing.total_price.toLocaleString()}{" "}
                                <small>
                                    {reserva.currency}
                                </small>
                            </span>

                        </div>

                    </div>

                </div>


                <div className="modal-details">

                    <button
                        className="btn btn-primario"
                        onClick={onClose}
                    >
                        {t("historyReservation.closeConfirm", "Entendido y cerrar")}
                    </button>

                </div>

            </div>
        </div>
    );
}

export default ReservationDetailModal;