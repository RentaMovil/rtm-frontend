import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle, } from "react-icons/fi";

import { FaBuilding, FaCar } from "react-icons/fa";
import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { useBranches } from "../hooks/useBranch";
import { useCreateBranch } from "../hooks/useCreateBranch";
import { useUpdateBranch } from "../hooks/useUpdateBranch";
import { useDeleteBranch } from "../hooks/useDeleteBranch";
import { useCars } from "../../../vehicles/hooks/useCars";
import "./Branches.css";
import MapComponent from "../../../booking/components/MapComponents";
function formatHour(time) {
  const [hStr, minutes] = time.split(":");
  const hour = parseInt(hStr, 10);
  const suffix = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12;
  return minutes === "00" ? `${hour12}${suffix}` : `${hour12}:${minutes}${suffix}`;
}

function formatSchedule(schedule, t) {
  const groups = [];
  schedule.forEach((day) => {
    const key = day.closed ? "closed" : `${day.open}-${day.close}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.endId = day.id;
    } else {
      groups.push({ key, startId: day.id, endId: day.id, ...day });
    }
  });
  return groups
    .map((group) => {
      const label =
        group.startId === group.endId
          ? t(`branches.daysAbbr.${group.startId}`)
          : `${t(`branches.daysAbbr.${group.startId}`)}–${t(`branches.daysAbbr.${group.endId}`)}`;
      if (group.closed) return `${label} ${t("branches.closedLabel")}`;
      if (group.open === "00:00" && group.close === "23:59") {
        return `${label} ${t("branches.hours24")}`;
      }
      return `${label} ${formatHour(group.open)}–${formatHour(group.close)}`;
    })
    .join(", ");
}

export default function Branches() {
  const { t } = useTranslation();

  const { branches, isLoading, error, refetch } = useBranches();
  // Cuenta todos los vehículos de la sucursal (también en mantenimiento o retirados): fleet no deja
  // eliminar una sucursal mientras alguno la referencie
  const { cars } = useCars({ allStatuses: true });
  const { createBranch, isLoading: isCreating } = useCreateBranch();
  const { updateBranch, isLoading: isUpdating } = useUpdateBranch();
  const { deleteBranch, isLoading: isDeleting } = useDeleteBranch();

  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState(undefined);
  const [scheduleDraft, setScheduleDraft] = useState([]);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formError, setFormError] = useState(null);

  const isModalOpen = editingItem !== undefined;
  const isDeleteModalOpen = deletingItem !== null;
  const isSaving = isCreating || isUpdating;
  const DEFAULT_LOCATION = { lat: 2.9273, lng: -75.2819 }; // Neiva, centro por defecto
  const [pickedLocation, setPickedLocation] = useState(DEFAULT_LOCATION);
  useEffect(() => {
    document.body.style.overflow = isModalOpen || isDeleteModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, isDeleteModalOpen]);

  // El conteo real de vehículos por sucursal, cruzando con /vehicles en vez de un campo fijo
  const branchesWithCount = useMemo(
    () => {
      // Aseguramos que branches y cars sean arreglos válidos antes de operar
      const listaBranches = branches || [];
      const listaCars = cars || [];

      return listaBranches.map((branch) => ({
        ...branch,
        vehiclesAssigned: listaCars.filter((car) => car?.branchId?.toString() === branch.id?.toString()).length
      }));
    },
    [branches, cars]
  );

  const totalVehicles = branchesWithCount.reduce((sum, b) => sum + b.vehiclesAssigned, 0);

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return branchesWithCount;
    return branchesWithCount.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.city.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query)
    );
  }, [branchesWithCount, search]);

  const openCreateModal = () => {
    setFormError(null);
    setPickedLocation(DEFAULT_LOCATION); // se resetea al centro por defecto en creación
    setScheduleDraft([
      { id: "mon", open: "08:00", close: "18:00", closed: false },
      { id: "tue", open: "08:00", close: "18:00", closed: false },
      { id: "wed", open: "08:00", close: "18:00", closed: false },
      { id: "thu", open: "08:00", close: "18:00", closed: false },
      { id: "fri", open: "08:00", close: "18:00", closed: false },
      { id: "sat", open: "08:00", close: "14:00", closed: false },
      { id: "sun", open: "00:00", close: "00:00", closed: true },
    ]);
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setFormError(null);
    // Si la sucursal ya tiene coordenadas guardadas, el mapa arranca ahí;
    // si no (sucursales creadas antes de este cambio), cae al centro por defecto.
    setPickedLocation(
      Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
        ? { lat: item.latitude, lng: item.longitude }
        : DEFAULT_LOCATION
    );
    setScheduleDraft(item.schedule.map((d) => ({ ...d })));
    setEditingItem(item);
  };
  const closeModal = () => setEditingItem(undefined);

  const toggleDayClosed = (dayId) => {
    setScheduleDraft((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, closed: !d.closed } : d))
    );
  };

  const updateDayTime = (dayId, field, value) => {
    setScheduleDraft((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const data = new FormData(e.target);
    const formData = {
      name: data.get("name"),
      city: data.get("city"),
      phone: data.get("phone"),
      address: data.get("address"),
      latitude: pickedLocation.lat,
      longitude: pickedLocation.lng,
      schedule: scheduleDraft,
    };

    try {
      if (editingItem) {
        await updateBranch(editingItem.id, formData);
      } else {
        await createBranch(formData);
      }
      await refetch();
      closeModal();
    } catch (err) {
      setFormError(err.message || t("branches.modal.saveError", { defaultValue: "No se pudo guardar la sucursal." }));
    }
  };
  const openDeleteModal = (item) => {
    if (item.vehiclesAssigned > 0) return;
    setDeletingItem(item);
  };
  const closeDeleteModal = () => setDeletingItem(null);

  const handleConfirmDelete = async () => {
    try {
      await deleteBranch(deletingItem.id);
      await refetch();
      closeDeleteModal();
    } catch (err) {
      console.error("Error al eliminar la sucursal:", err);
      closeDeleteModal();
    }
  };


  return (
    <div className="br-page">
      <NavBarAdmin />

      <div className="br-wrapper">
        <div className="br-header">
          <div>
            <h1 className="br-title">{t("branches.title")}</h1>
            <p className="br-subtitle">{t("branches.subtitle")}</p>
          </div>
          <button className="br-btn-add" onClick={openCreateModal}>
            <FiPlus /> {t("branches.btnAdd")}
          </button>
        </div>

        <div className="br-metrics">
          <div className="br-metric">
            <span className="br-metric-icon amber">
              <FaBuilding />
            </span>
            <div>
              <p className="br-metric-label">{t("branches.metricBranches")}</p>
              <p className="br-metric-value">
                {t("branches.metricBranchesValue", { count: branchesWithCount.length })}
              </p>
            </div>
          </div>
          <div className="br-metric">
            <span className="br-metric-icon emerald">
              <FaCar />
            </span>
            <div>
              <p className="br-metric-label">{t("branches.metricVehicles")}</p>
              <p className="br-metric-value">
                {t("branches.metricVehiclesValue", { count: totalVehicles })}
              </p>
            </div>
          </div>
        </div>

        <div className="br-card">
          <div className="br-toolbar">
            <div className="br-search">
              <FiSearch />
              <input
                type="text"
                placeholder={t("branches.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="br-count">
              {t("branches.showingCount", { count: filteredBranches.length })}
            </span>
          </div>

          {isLoading && <p className="br-empty">{t("branches.loading", { defaultValue: "Cargando sucursales..." })}</p>}
          {!isLoading && error && <p className="br-empty">{error}</p>}

          {!isLoading && !error && (
            <div className="br-table-wrap">
              <table className="br-table">
                <thead>
                  <tr>
                    <th>{t("branches.colName")}</th>
                    <th>{t("branches.colAddress")}</th>
                    <th>{t("branches.colCity")}</th>
                    <th>{t("branches.colPhone")}</th>
                    <th>{t("branches.colSchedule")}</th>
                    <th className="right">{t("branches.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch) => {
                    const isOpening = branch.vehiclesAssigned === 0;
                    return (
                      <tr key={branch.id}>
                        <td>
                          <div className="br-name">
                            <span className={`br-dot ${isOpening ? "gray" : "green"}`} />
                            {branch.name}
                          </div>
                        </td>
                        <td className="br-address">{branch.address}</td>
                        <td>
                          <span className="br-city-badge">{branch.city}</span>
                        </td>
                        <td className="br-phone">{branch.phone}</td>
                        <td>
                          <div className="br-schedule-text">
                            {formatSchedule(branch.schedule, t)}
                          </div>
                          <button
                            type="button"
                            className="br-link-btn"
                            onClick={() => openEditModal(branch)}
                          >
                            {t("branches.viewSchedule")}
                          </button>
                        </td>
                        <td className="right">
                          <div className="br-actions">
                            <button
                              className="br-btn-edit"
                              aria-label={t("branches.editAria", { name: branch.name })}
                              onClick={() => openEditModal(branch)}
                            >
                              <FiEdit2 />
                            </button>
                            {branch.vehiclesAssigned > 0 ? (
                              <span className="br-tooltip-wrap">
                                <button className="br-btn-delete" disabled>
                                  <FiTrash2 />
                                </button>
                                <span className="br-tooltip">
                                  {t("branches.deleteBlockedTooltip")}
                                </span>
                              </span>
                            ) : (
                              <button
                                className="br-btn-delete"
                                aria-label={t("branches.deleteAria", { name: branch.name })}
                                onClick={() => openDeleteModal(branch)}
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && filteredBranches.length === 0 && (
            <div className="br-empty">{t("branches.emptyState")}</div>
          )}
        </div>
      </div>

      <FooterAdmin />

      {isModalOpen && (
        <div className="br-modal-overlay" onClick={closeModal}>
          <div className="br-modal" onClick={(e) => e.stopPropagation()}>
            <div className="br-modal-header">
              <h3>
                <FaBuilding />
                {editingItem ? t("branches.modal.editTitle") : t("branches.modal.createTitle")}
              </h3>
              <button
                type="button"
                className="br-modal-close"
                onClick={closeModal}
                aria-label={t("branches.modal.close")}
              >
                <FiX />
              </button>
            </div>

            <form id="branchForm" className="br-modal-form" onSubmit={handleSubmit}>
              <label className="br-field">
                {t("branches.modal.name")}
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingItem?.name ?? ""}
                  placeholder={t("branches.modal.namePlaceholder")}
                />
              </label>

              <div className="br-field-row">
                <label className="br-field">
                  {t("branches.modal.city")}
                  <input
                    name="city"
                    type="text"
                    required
                    defaultValue={editingItem?.city ?? ""}
                    placeholder={t("branches.modal.cityPlaceholder")}
                  />
                </label>
                <label className="br-field">
                  {t("branches.modal.phone")}
                  <input
                    name="phone"
                    type="text"
                    required
                    defaultValue={editingItem?.phone ?? ""}
                    placeholder={t("branches.modal.phonePlaceholder")}
                  />
                </label>
              </div>

              <label className="br-field">
                {t("branches.modal.address")}
                <input
                  name="address"
                  type="text"
                  required
                  defaultValue={editingItem?.address ?? ""}
                  placeholder={t("branches.modal.addressPlaceholder")}
                />
              </label>
              <label className="br-field">
                {t("branches.modal.address")}
                <input
                  name="address"
                  type="text"
                  required
                  defaultValue={editingItem?.name ?? ""}
                  placeholder={t("branches.modal.addressPlaceholder")}
                />
              </label>

              {/* NUEVO: selector de ubicación */}
              <div className="br-field">
                <label>{t("branches.mapLabel")}</label>
                <MapComponent
                  mode="pick"
                  pickedLat={pickedLocation.lat}
                  pickedLng={pickedLocation.lng}
                  onPick={setPickedLocation}
                />
                <p className="br-map-hint" style={{ fontSize: "0.8rem", color: "#666", marginTop: "4px" }}>
                  Lat: {pickedLocation.lat.toFixed(6)} — Lng: {pickedLocation.lng.toFixed(6)}
                </p>
              </div>


              <div className="br-schedule-section">
                <div className="br-schedule-heading">
                  <div>
                    <h4>{t("branches.modal.scheduleTitle")}</h4>
                    <p>{t("branches.modal.scheduleSubtitle")}</p>
                  </div>
                  <span className="br-timezone-badge">{t("branches.modal.timezone")}</span>
                </div>

                <div className="br-schedule-list">
                  {scheduleDraft.map((day) => (
                    <div key={day.id} className={`br-day-row ${day.closed ? "closed" : ""}`}>
                      <span className="br-day-label">{t(`branches.days.${day.id}`)}</span>
                      <div className="br-day-times">
                        <input
                          type="time"
                          value={day.open}
                          disabled={day.closed}
                          onChange={(e) => updateDayTime(day.id, "open", e.target.value)}
                        />
                        <span>{t("branches.modal.timeSeparator")}</span>
                        <input
                          type="time"
                          value={day.close}
                          disabled={day.closed}
                          onChange={(e) => updateDayTime(day.id, "close", e.target.value)}
                        />
                      </div>
                      <label className="br-day-closed">
                        <input
                          type="checkbox"
                          checked={day.closed}
                          onChange={() => toggleDayClosed(day.id)}
                        />
                        {t("branches.modal.closedLabel")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="br-delete-text" style={{ color: "#c0392b" }}>
                  {formError}
                </p>
              )}
            </form>

            <div className="br-modal-footer">
              <button type="button" className="br-btn-secondary" onClick={closeModal} disabled={isSaving}>
                {t("branches.modal.cancel")}
              </button>
              <button type="submit" form="branchForm" className="br-btn-primary" disabled={isSaving}>
                {isSaving ? t("branches.modal.saving", { defaultValue: "Guardando..." }) : t("branches.modal.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="br-modal-overlay" onClick={closeDeleteModal}>
          <div className="br-modal br-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="br-modal-header">
              <h3>
                <FiAlertCircle className="br-icon-danger" />
                {t("branches.deleteModal.title")}
              </h3>
              <button
                type="button"
                className="br-modal-close"
                onClick={closeDeleteModal}
                aria-label={t("branches.modal.close")}
              >
                <FiX />
              </button>
            </div>

            <div className="br-modal-form">
              <p className="br-delete-text">
                {t("branches.deleteModal.text", { name: deletingItem?.name })}
              </p>
            </div>

            <div className="br-modal-footer">
              <button type="button" className="br-btn-secondary" onClick={closeDeleteModal} disabled={isDeleting}>
                {t("branches.modal.cancel")}
              </button>
              <button type="button" className="br-btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? t("branches.modal.deleting") : t("branches.deleteModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
