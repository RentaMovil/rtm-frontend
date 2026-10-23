import style from './MaintenanceForm.module.css';
import { AiOutlineDashboard } from 'react-icons/ai';
import Animation from '../../../../shared/components/layout/Animation';
import { useMemo, useState } from 'react';
import ValidateDate from './ValidateDate';
import VehicleCard from './VehcileCard';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import FilterVehicle from './FilterVehicle';
import { useVehicles } from '../../registerVehicle/hooks/useVehicles';
import { VEHICLE_STATUS } from '../../registerVehicle/constans/vehicleStatus';
import { useCreateMaintenance } from '../hooks/useCreateMaintenance';
import { useMaintenanceTypes } from '../hooks/useMaintenanceTypes';
import { FiShield, FiDollarSign, FiStar, FiPlus, FiEdit2, FiTrash2, FiX, FiInfo, FiAlertCircle } from "react-icons/fi";


function MaintenanceForm() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, reset, setValue, setError, watch } = useForm();
    const [mos, setMos] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [costError, setCostError] = useState(false);

    const { vehicles, refetch } = useVehicles();
    const { createMaintenance, isLoading } = useCreateMaintenance();
    const { maintenanceTypes } = useMaintenanceTypes();

    // Solo se puede iniciar ya si el vehículo está disponible; si no, se programa
    const canStartNow = selectedVehicle?.status === VEHICLE_STATUS.AVAILABLE;
    const startNow = watch('startNow') && canStartNow;

    const filteredVehicles = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        // Un vehículo retirado no recibe mantenimientos
        return vehicles
            .filter((vehicle) => vehicle.status !== VEHICLE_STATUS.RETIRED)
            .filter((vehicle) => {
                const vehicleName = [vehicle.brandName, vehicle.modelName]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                const plate = String(vehicle.plate || '').toLowerCase();
                return !searchTerm || vehicleName.includes(searchTerm) || plate.includes(searchTerm);
            });
    }, [search, vehicles]);

    function selectVehicle(vehicle) {
        setSelectedVehicle(vehicle);
        setValue('plate', vehicle.plate, { shouldValidate: true });
        setValue('model', vehicle.modelName, { shouldValidate: true });
        setValue('brand', vehicle.brandName, { shouldValidate: true });
        if (vehicle.status !== VEHICLE_STATUS.AVAILABLE) setValue('startNow', false);
    }

    async function insert(data) {
        if (isLoading) return;

        if (!selectedVehicle) {
            setError('plate', {
                type: 'manual',
                message: t('MaintenanceForm.selectVehicle', {
                    defaultValue: 'Selecciona un vehículo de la lista'
                })
            });
            return;
        }

        try {
            setMos(true);
            setSubmitError('');

            data.vehicleId = selectedVehicle.id;
            data.startNow = startNow;
            data.image = selectedVehicle.image || ''; // reutiliza la foto del registro del vehículo

            // El backend pone el vehículo en Mantenimiento cuando el mantenimiento inicia
            await createMaintenance(data);
            await refetch();

            reset();
            setSelectedVehicle(null);
            setSearch('');
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            setSubmitError(error.message);
        } finally {
            setMos(false);
        }
    }

    return (
        <div className={style['maintenance-container']}>
            <div className={style['maintenance-sidebar']}>
                <div className={style['maintenance-panel']}>
                    <div className={style['panel-header']}>
                        <div>
                            <h3>{t('MaintenanceForm.title')}</h3>
                            <p>{t('MaintenanceForm.search')}</p>
                        </div>
                    </div>
                    <FilterVehicle query={search} setSearch={setSearch} />
                    <VehicleCard
                        vehicles={filteredVehicles}
                        selectedVehicle={selectedVehicle}
                        onSelect={selectVehicle}
                        emptyMessage={t('MaintenanceForm.noFound')}
                    />
                </div>
            </div>
            <form className={style['maintenance-form']} onSubmit={handleSubmit(insert)}>
                <div className={style['maintenance-form-left']}>
                    <div className={style['maintenance-continerfor']}>
                        <h2>{t('MaintenanceForm.newMaintenance')}</h2>
                        <div className={style['maintenance-form-input']}>
                            <label htmlFor="plate">{t('CheckStatus.modal.plate')}</label>
                            <input
                                type="text"
                                placeholder={t('CheckStatus.modal.platePlaceholder')}
                                readOnly
                                {...register('plate', { required: t('CheckStatus.modal.requiredPlate') })}
                            />
                            {errors.plate && (
                                <p className={style['error-message']}>
                                    <AiOutlineDashboard /> {errors.plate.message}
                                </p>
                            )}
                        </div>

                        <div className={style['maintenance-form-input']}>
                            <label htmlFor="model">{t('MaintenanceForm.model')}</label>
                            <input
                                type="text"
                                placeholder={t('MaintenanceForm.modelPlaceholder')}
                                readOnly
                                {...register('model', { required: t('MaintenanceForm.requiredModel') })}
                            />
                            {errors.model && (
                                <p className={style['error-message']}>
                                    <AiOutlineDashboard /> {errors.model.message}
                                </p>
                            )}
                        </div>
                        <div className={style['maintenance-form-right']}>
                            <div className={style['maintenance-form-input']}>
                                <label htmlFor="brand">{t('MaintenanceForm.brand')}</label>
                                <input
                                    type="text"
                                    placeholder={t('MaintenanceForm.brandPlaceholder')}
                                    readOnly
                                    {...register('brand', { required: t('MaintenanceForm.requiredBrand') })}
                                />
                                {errors.brand && (
                                    <p className={style['error-message']}>
                                        <AiOutlineDashboard /> {errors.brand.message}
                                    </p>
                                )}
                            </div>
                            <div className={style['maintenance-form-input']}>
                                <label htmlFor="date">{t('MaintenanceForm.date')}</label>
                                <input
                                    type="date"
                                    placeholder={t('MaintenanceForm.datePlaceholder')}
                                    disabled={startNow}
                                    {...register('date', {
                                        required: !startNow && t('MaintenanceForm.requiredDate'),
                                        validate: (value) => startNow || ValidateDate(value)
                                    })}
                                />
                                <div className={style['maintenance-start-now-row']}>
                                    <label className={style['maintenance-start-now']}>
                                        <input type="checkbox" disabled={!canStartNow} {...register('startNow')} />
                                        <span>{t('MaintenanceForm.startNow')}</span>
                                    </label>
                                </div>
                                {errors.date && (
                                    <p className={style['error-message']}>
                                        <AiOutlineDashboard /> {errors.date.message}
                                    </p>
                                )}
                            </div>
                            <div className={style['maintenance-form-input']}>
                                <label htmlFor="price">{t("vehicleForm.price")}</label>
                                <div className="it-cost-input">
                                    <span>COP $</span>
                                    <input
                                        id="price"
                                        type="number"
                                        placeholder="Ej: 100000"
                                        step="any"
                                        {...register('price', {
                                            required: t("vehicleForm.priceRequired"),
                                            valueAsNumber: true,
                                            min: { value: 0, message: t("vehicleForm.minLenghtPrice") },
                                            max: { value: 100000000, message: t("vehicleForm.maxLenghtPrice") },
                                            onChange: () => costError && setCostError(false)
                                        })}
                                    />
                                </div>
                                {errors.price && (
                                    <p className={style['error-message']}>
                                        <AiOutlineDashboard /> {errors.price.message}
                                    </p>
                                )}
                            </div>
                            <div className={style['maintenance-form-input']}>
                                <label htmlFor="maintenanceType">{t("MaintenanceForm.Type")}</label>
                                <select
                                    defaultValue=""
                                    {...register('maintenanceTypeId', { required: t("MaintenanceForm.requiredType") })}
                                >
                                    <option value="" disabled>{t("MaintenanceForm.placeholderType")}</option>
                                    {maintenanceTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{t(`MaintenanceForm.types.${type.name}`, { defaultValue: type.name })}</option>
                                    ))}
                                </select>
                                {errors.maintenanceTypeId && (
                                    <p className={style['error-message']}>
                                        <AiOutlineDashboard /> {errors.maintenanceTypeId.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={style['maintenance-form-observations']}>
                            <div className={style['maintenance-form-input']}>
                                <label htmlFor="maintenance-notes">{t("MaintenanceForm.observations")}</label>
                                <textarea
                                    placeholder={t("MaintenanceForm.placeholderObservations")}
                                    className={style['maintenance-observatios']}
                                    rows={2}
                                    {...register('observations', {
                                        minLength: { value: 5, message: t("MaintenanceForm.minLenghtObservations") },
                                        maxLength: { value: 200, message: t("MaintenanceForm.maxLenghtObservations") }
                                    })}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                />
                                {errors.observations?.type === 'minLength' && (
                                    <p className={style['error-message']}>
                                        <AiOutlineDashboard /> {errors.observations.message}
                                    </p>
                                )}
                                {errors.observations?.type === 'maxLength' && (
                                    <p className={style['error-message']}>
                                        <AiOutlineDashboard /> {errors.observations.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={style['maintenance-form-buttons']}>
                        <button className="save" type="submit" disabled={isLoading}>
                            {isLoading ? t("MaintenanceForm.saving") : t("MaintenanceForm.save")}
                        </button>
                        {submitError && <p className={style['error-message']}>{submitError}</p>}
                        <span className={style['vehicule-animation']}>
                            {mos && <Animation />}
                        </span>
                        <button className="history" type="button" onClick={() => navigate('/History')}>
                            {t("MaintenanceForm.history")}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default MaintenanceForm;
