import React, { useState } from 'react';
import CartVehicleHistory from '../../historyMaintenance/components/CartVehicleHistory.jsx';
import style from './History.module.css';
import FooterAdmin from '../../../../shared/components/layout/FooterAdmin.jsx';
import { useForm } from 'react-hook-form';
import { AiOutlineDashboard } from 'react-icons/ai';
import ValidateDate from '../../registerMaintenance/components/ValidateDate.jsx';
import FiltrerStatus from "../../historyMaintenance/components/FiltrerHistory.jsx";
import { useTranslation } from "react-i18next";
import NavbarAdmin from '../../../../shared/components/layout/NavBarAdmin.jsx';
import FleetChartMaintenance from '../../historyMaintenance/components/FleetChartMaintenance.jsx';
import MonthlyChart from '../../historyMaintenance/components/MonthlyChart.jsx';
import { useMaintenances } from '../hooks/useMaintenances.js';
import { useUpdateMaintenance } from '../hooks/useUpdateMaintenance.js';
import { useChangeMaintenanceStatus } from '../hooks/useChangeMaintenanceStatus.js';
import { useMaintenanceTypes } from '../../registerMaintenance/hooks/useMaintenanceTypes.js';
import { MAINTENANCE_STATUS, MAINTENANCE_STATUS_KEY, isClosedMaintenance } from '../../maintenance/constans/maintenanceStatus.js';
import { formatDate } from '../../maintenance/service/maintenanceMapper.js';

// Fecha de hoy en formato yyyy-mm-dd (hora local)
function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function History() {
  const { t } = useTranslation();
  const { register, formState: { errors }, handleSubmit, reset } = useForm();

  const { records, refetch } = useMaintenances();
  const { updateMaintenance } = useUpdateMaintenance();
  const { changeStatus } = useChangeMaintenanceStatus();
  const { maintenanceTypes } = useMaintenanceTypes();

  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [query, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");

  const filteredRecords = records
    .filter((c) => {
      const fs = String(filterState || '').toLowerCase();
      if (fs === 'all' || fs === '') return true;
      return String(c.status || '').toLowerCase() === fs;
    })
    .filter((c) => {
      const q = String(query || '').trim().toLowerCase();
      if (!q) return true;
      return (
        String(c.modelName || '').toLowerCase().includes(q) ||
        String(c.plate || '').toLowerCase().includes(q) ||
        String(c.typeMaintenance || '').toLowerCase().includes(q)
      );
    });

  const closeModal = () => {
    setSelected(null);
    setConfirmCancel(false);
    setIsEditing(false);
    setActionError('');
  };

  // Iniciar, completar o cancelar. "Eliminar" ya no existe: un mantenimiento se cancela (INV-005)
  const changeRecordStatus = async (status) => {
    try {
      setActionError('');
      await changeStatus(selected.id, status);
      await refetch();
      closeModal();
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      setActionError(error.message);
    }
  };

  const handleSaveEdit = async (data) => {
    try {
      setActionError('');
      await updateMaintenance(selected.id, data);
      await refetch();
      closeModal();
    } catch (error) {
      console.error('Error al actualizar el registro:', error);
      setActionError(error.message);
    }
  };

  const openEdit = (rec) => {
    setIsEditing(true);
    setActionError('');
    reset({
      maintenanceTypeId: rec.maintenanceTypeId,
      date: rec.date?.slice(0, 10),
      price: rec.cost ?? 0,
      observations: rec.description,
    });
  };

  // Programado: hoy a dos meses. En progreso: no puede iniciar en el futuro.
  const validateEditDate = (value) => {
    if (selected?.status === MAINTENANCE_STATUS.IN_PROGRESS) {
      return value <= todayIso() || t("History.futureDate");
    }
    return ValidateDate(value);
  };

  return (
    <>
      <NavbarAdmin />
      <div className={style["history-container"]}>
        <h2 className={style["history-h2"]}>{t("History.title")}</h2>
        <div className={style["card-container-setSearch"]}>
          <FiltrerStatus query={query} setSearch={setSearch} filterState={filterState} setFilterState={setFilterState} />
        </div>
        <div className={style["card-container-fleetc"]}>
          <FleetChartMaintenance records={filteredRecords} />
        </div>
        <MonthlyChart records={filteredRecords} />
        <div className={style.list}>
          {filteredRecords.map(r => (
            <CartVehicleHistory key={r.id} record={r} onViewMore={setSelected} />
          ))}
        </div>

        {selected && (
          <div className={style.modalBackdrop} onClick={closeModal}>
            <div className={style["history-modal"]} onClick={(e) => e.stopPropagation()}>
              <div className={style["history-modal-header"]}>
                <h3>{t("History.detail")} - {selected.plate}</h3>
                <button type="button" className={style["history-modal-close"]} onClick={closeModal} aria-label={t("CheckStatus.modal.close")}>×</button>
              </div>

              {isEditing ? (
                <form className={style["history-form"]} onSubmit={handleSubmit(handleSaveEdit)}>
                  <label htmlFor="maintenanceTypeId">{t("maintenanceForm.TypeMaintenance")}</label>
                  <select {...register("maintenanceTypeId", { required: t("maintenanceForm.requiredMaintenance") })}>
                    {maintenanceTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  {errors.maintenanceTypeId && <p className={style['error-message']}><AiOutlineDashboard /> {errors.maintenanceTypeId.message}</p>}

                  <label htmlFor="date">{t("maintenanceForm.date")}</label>
                  <input type="date" placeholder={t("maintenanceForm.datePlaceholder")}
                    {...register("date", { required: t("maintenanceForm.requiredDate"), validate: validateEditDate })}
                  />
                  {errors.date && <p className={style['error-message']}><AiOutlineDashboard /> {errors.date.message}</p>}

                  <label htmlFor="price">{t("History.cost")}</label>
                  <input type="number" step="100"
                    {...register("price", {
                      required: t("vehicleForm.priceRequired"),
                      valueAsNumber: true,
                      min: { value: 0, message: t("vehicleForm.minLenghtPrice") },
                      max: { value: 100000000, message: t("vehicleForm.maxLenghtPrice") }
                    })}
                  />
                  {errors.price && <p className={style['error-message']}><AiOutlineDashboard /> {errors.price.message}</p>}

                  <label htmlFor="maintenance-notes">{t("MaintenanceForm.observations")}</label>
                  <div className={style['history-form-observations']}>
                    <textarea
                      placeholder={t("maintenanceForm.placeholderObservations")}
                      className={style["MaintenanceForm.observations"]}
                      rows={2}
                      {...register("observations", {
                        minLength: { value: 5, message: t("maintenanceForm.PminLenghtObservations") },
                        maxLength: { value: 200, message: t("maintenanceForm.PmaxLenghtObservations") }
                      })}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                  </div>
                  {errors.observations?.type === "minLength" && <p className={style['error-message']}><AiOutlineDashboard /> {errors.observations.message}</p>}
                  {errors.observations?.type === "maxLength" && <p className={style['error-message']}><AiOutlineDashboard /> {errors.observations.message}</p>}

                  {actionError && <p className={style['error-message']}>{actionError}</p>}

                  <div className={style['modal-footer']}>
                    <button className={style['modal-button-secondary']} type="button" onClick={() => setIsEditing(false)}>{t("History.cancel")}</button>
                    <button className={style['modal-button-primary']} type="submit">{t("History.save")}</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className={style["history-details"]}>
                    <p><strong>{t("History.model")} :</strong> <span>{selected.brandName} {selected.modelName}</span></p>
                    <p><strong>{t("maintenanceForm.TypeMaintenance")} :</strong> <span>{selected.typeMaintenance}</span></p>
                    <p><strong>{t("maintenanceForm.date")} :</strong> <span>{formatDate(selected.date)}{selected.endDate && ` - ${formatDate(selected.endDate)}`}</span></p>
                    <p><strong>{t("History.cost")} :</strong> <span>{Number(selected.cost ?? 0).toLocaleString()}</span></p>
                    <p><strong>{t("History.status")} :</strong> <span>{t(`FleetChartMaintenance.${MAINTENANCE_STATUS_KEY[selected.status]}`)}</span></p>
                    <p><strong>{t("MaintenanceForm.observations")} :</strong> <span>{selected.description || t("maintenanceForm.placeholderObservations")}</span></p>
                  </div>

                  {isClosedMaintenance(selected.status) && <p>{t("History.closedReadOnly")}</p>}
                  {actionError && <p className={style['error-message']}>{actionError}</p>}

                  <div className={style['modal-actions-btn']}>
                    {/* Acciones según el estado: los cerrados (completado/cancelado) son de solo lectura */}
                    {!isClosedMaintenance(selected.status) && !confirmCancel && (
                      <>
                        <button className={style['modal-button-primary']} onClick={() => openEdit(selected)}>{t("History.edit")}</button>
                        {selected.status === MAINTENANCE_STATUS.SCHEDULED && (
                          <button className={style['modal-button-primary']} onClick={() => changeRecordStatus(MAINTENANCE_STATUS.IN_PROGRESS)}>{t("History.start")}</button>
                        )}
                        {selected.status === MAINTENANCE_STATUS.IN_PROGRESS && (
                          <button className={style['modal-button-primary']} onClick={() => changeRecordStatus(MAINTENANCE_STATUS.COMPLETED)}>{t("History.complete")}</button>
                        )}
                        <button className={style['modal-button-danger']} onClick={() => setConfirmCancel(true)}>{t("History.cancelMaintenance")}</button>
                      </>
                    )}
                    {confirmCancel && (
                      <div className={style["modal-confirm"]}>
                        <p>{t("History.isCancel")}</p>
                        <button className={style['modal-button-danger']} onClick={() => changeRecordStatus(MAINTENANCE_STATUS.CANCELLED)}>{t("History.confirm")}</button>
                        <button className={style['modal-button-secondary']} onClick={() => setConfirmCancel(false)}>{t("History.back")}</button>
                      </div>
                    )}
                    <button className={style['modal-button-secondary']} onClick={closeModal}>{t("History.close")}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <FooterAdmin />
    </>
  );
}
export default History;