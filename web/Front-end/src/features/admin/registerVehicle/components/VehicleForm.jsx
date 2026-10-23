import style from './VehicleForm.module.css';
import { AiOutlineDashboard } from "react-icons/ai";
import { FiInfo } from "react-icons/fi";
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Animation from '../../../../shared/components/layout/Animation';
import FileDialog from "../../../../shared/components/layout/FileDialog";
import { useTranslation } from 'react-i18next';
import { getValidVehicleYearRange, validateVehicleYear } from '../../../../shared/utils/calculateAge';
import { useCreateVehicle } from '../hooks/useCreateVehicle';
import { useImageUpload } from '../../../../shared/hooks/useImageUpload';
import { useBranches } from '../../branches/hooks/useBranch';
import { useVehicleCatalog } from '../hooks/useVehicleCatalog';
import { VEHICLE_STATUS, VEHICLE_STATUS_LABEL } from '../constans/vehicleStatus';

function VehicleForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { branches } = useBranches()
    const { register, formState: { errors }, handleSubmit, reset, setError, clearErrors } = useForm();
    // El backend solo necesita modelId; marca/categoría/combustible van en el texto del option
    const { models, error: catalogError } = useVehicleCatalog();
    const [submitError, setSubmitError] = useState(null);
    const [mos, setmos] = useState(false);
    const [vehicleFile, setVehicleFile] = useState(null); // esto verificará el estado del fileDialog
    const [isLoading, setIsLoading] = useState(false);// agrega un estado de carga
    const { minYear, maxYear, currentYear } = getValidVehicleYearRange(1); // optiene el rango de los vehiclos permitidos


    const { createVehicle, isLoading: isCreating } = useCreateVehicle();
    const { uploadImage, isUploading } = useImageUpload();


    const handleFileChange = (file) => {
        setVehicleFile(file);

        if (file) clearErrors('vehicleImage');
    }


    async function insert(data) {
        if (!vehicleFile) {
            setError('vehicleImage', { type: 'required', message: 'Este apartado es obligatorio' });
            return;
        }
        setSubmitError(null);
        try {
            data.image = await uploadImage(vehicleFile);
            await createVehicle(data);

            setmos(true);
            setTimeout(() => {
                setmos(false);
                setVehicleFile(null);
                reset();
            }, 2200);
        } catch (err) {
            // 409 PLATE_ALREADY_EXISTS va junto a la placa; cualquier otro error, junto al botón
            if (err.code === 'PLATE_ALREADY_EXISTS') {
                setError('plate', { type: 'server', message: t('vehicleForm.plateExists') });
            } else {
                setSubmitError(err.message);
            }
        }
    }
    return (
        <div className={style['vehicle-form']}>
            <div className={style['form-container']}>
                <div className={style['page-header']}>
                    <h1>{t('vehicleForm.title')}</h1>
                    <p className={style['page-subtitle']}>{t('vehicleForm.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit(insert)}>
                    <div className={style['form-card']}>
                        <div className={style['form-grid']}>
                            {/* Columna izquierda */}
                            <div className={style['form-col']}>
                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="plate">{t('vehicleForm.plate')}</label>
                                    <input type="text" placeholder={t('vehicleForm.placeholderPlate')}
                                        {...register("plate", {
                                            required: t('vehicleForm.requiredPlate'),
                                            pattern: {
                                                value: /^[A-Z]{3}[0-9]{2}[A-Z0-9]?$/,
                                                message: t('vehicleForm.invalidPlate')
                                            },
                                            onChange: (e) => { e.target.value = e.target.value.toUpperCase() }
                                        })} />
                                    {errors.plate && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.plate.message}
                                        </p>
                                    )}
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="modelId">{t('vehicleForm.modelAndSpec')}</label>
                                    <select
                                        id="modelId"
                                        {...register("modelId", { required: t("vehicleForm.requiredModel") })}
                                        defaultValue="">
                                        <option value="" disabled>{t('vehicleForm.disabledModel')}</option>
                                        {models.map((model) => (
                                            <option key={model.id} value={model.id}>
                                                {model.brand.name} {model.name} — {model.category.name} — {model.engineType.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className={style['field-hint']}>{t('vehicleForm.modelSpecHint')}</p>
                                    {errors.modelId && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.modelId.message}
                                        </p>
                                    )}
                                    {catalogError && <p className={style['error-message']}><AiOutlineDashboard /> {catalogError}</p>}
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor='capacity'>{t('vehicleForm.capacity')}</label>
                                    <input
                                        type="number"
                                        placeholder="Ej: 5"
                                        id="capacity"
                                        {...register("capacity", {
                                            required: t('vehicleForm.requiredCapacity'),
                                            min: { value: 1, message: t('vehicleForm.minLenghtCapacity') },
                                            max: { value: 100, message: t('vehicleForm.maxLenghtCapacity') }
                                        })}
                                    />
                                    {errors.capacity && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.capacity.message}
                                        </p>
                                    )}
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor='age'>{t("vehicleForm.age")}</label>
                                    <input
                                        type="number"
                                        placeholder={`Ej: ${currentYear}`}
                                        step="1"
                                        {...register('age', {
                                            required: t("vehicleForm.ageRequired"),
                                            valueAsNumber: true,
                                            validate: (value) => {
                                                const validationResult = validateVehicleYear(value, 1);

                                                if (validationResult === 'YEAR_TOO_LOW') {
                                                    return t("vehicleForm.minLenghtAge", { min: minYear }) || `El año debe ser mayor a ${minYear}`;
                                                }
                                                if (validationResult === 'YEAR_TOO_HIGH') {
                                                    return t("vehicleForm.maxLenghtAge", { max: maxYear }) || `El año no puede superar ${maxYear}`;
                                                }
                                                if (validationResult === 'INVALID_NUMBER') {
                                                    return t("vehicleForm.invalidAge") || "Ingresa un año válido";
                                                }

                                                return true;
                                            }
                                        })}
                                    />
                                    {errors.age && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.age.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className={style['form-col']}>
                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="price">{t("vehicleForm.pricePerDay")}</label>
                                    <div className="it-cost-input">
                                        <span>COP $</span>
                                        <input
                                            id="price"
                                            type="number"
                                            placeholder="Ej: 100000"
                                            step="100"
                                            {...register('price', {
                                                required: t("vehicleForm.priceRequired"),
                                                valueAsNumber: true,
                                                min: { value: 0, message: t("vehicleForm.minLenghtPrice") },
                                                max: { value: 100000000, message: t("vehicleForm.maxLenghtPrice") }
                                            })}
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.price.message}
                                        </p>
                                    )}
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="branchId">{t('vehicleForm.branch')}</label>
                                    <select
                                        id="branchId"
                                        {...register("branchId", {
                                            required: t('vehicleForm.requiredBranch'),
                                            validate: value => value !== "" || t('vehicleForm.requiredBranch')
                                        })}
                                        defaultValue="">
                                        <option value="" disabled>{t('vehicleForm.disabledBranch')}</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                    {errors.branchId && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.branchId.message}
                                        </p>
                                    )}
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor='mileage'>{t("vehicleForm.mileageInitial")}</label>
                                    <input
                                        type="number"
                                        placeholder="Ej: 10000"
                                        id="mileage"
                                        step="1000"
                                        {...register('mileage', {
                                            required: t("vehicleForm.mileageRequired"),
                                            valueAsNumber: true,
                                            min: { value: 0, message: t("vehicleForm.minLenghtMileage") },
                                            max: { value: 1000000, message: t("vehicleForm.maxLenghtMileage") }
                                        })}
                                    />
                                    {errors.mileage && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.mileage.message}
                                        </p>
                                    )}
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label>{t('vehicleForm.photoLabel')}</label>
                                    <FileDialog onFileChange={handleFileChange} file={vehicleFile} />
                                    {errors.vehicleImage && (<p className={style['error-message']}><AiOutlineDashboard />{errors.vehicleImage?.message}</p>)}
                                </div>
                            </div>
                        </div>

                        <div className={style['form-footer-bar']}>
                            <span className={style['info-note']}>
                                <FiInfo /> {t('vehicleForm.infoNote')}
                            </span>
                            <span className={style['initial-state']}>
                                {t('vehicleForm.initialState')} <span className={style['state-badge']}>{VEHICLE_STATUS_LABEL[VEHICLE_STATUS.AVAILABLE]}</span>
                            </span>
                        </div>
                    </div>

                    {submitError && <p className={style['error-message']}><AiOutlineDashboard /> {submitError}</p>}

                    <div className={style['form-actions']}>
                        <button type="button" className={style.cancel} onClick={() => navigate(-1)}>
                            {t('dialog.cancel')}
                        </button>
                        <button className={style.save} type="submit" disabled={isLoading}>
                            {isLoading ? t('vehicleForm.saving') : t('vehicleForm.saveVehicle')}
                        </button>
                    </div>
                    <span className={style["vehicule-animation"]}>
                        {mos && <Animation />}
                    </span>
                </form>
            </div>
        </div>
    );
}
export default VehicleForm;
