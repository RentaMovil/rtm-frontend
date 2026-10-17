import style from './VehicleForm.module.css';
import { AiOutlineDashboard } from "react-icons/ai";
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Animation from '../../../../shared/components/layout/Animation';
import FileDialog from "../../../../shared/components/layout/FileDialog";
import { useTranslation } from 'react-i18next';
import { getValidVehicleYearRange, validateVehicleYear } from '../../../../shared/utils/calculateAge';
import { useCreateVehicle } from '../hooks/useCreateVehicle';
import { useImageUpload } from '../../../../shared/hooks/useImageUpload';
import { useBranches } from '../../branches/hooks/useBranch';
import { useVehicleCatalog } from '../hooks/useVehicleCatalog';

function VehicleForm() {
    const { t } = useTranslation();
    const { branches } = useBranches()
    const { register, formState: { errors }, handleSubmit, reset, setError, clearErrors, setValue, watch } = useForm();
    const { brands, models, error: catalogError } = useVehicleCatalog();
    const [submitError, setSubmitError] = useState(null);
    const selectedBrandId = watch('brandId');
    const selectedModel = models.find((model) => String(model.id) === String(watch('modelId')));
    const brandModels = models.filter((model) => String(model.brand.id) === String(selectedBrandId));
    const [mos, setmos] = useState(false);
    const [vehicleFile, setVehicleFile] = useState(null); // esto verificará el estado del fileDialog
    const { minYear, maxYear, currentYear } = getValidVehicleYearRange(1); // optiene el rango de los vehiclos permitidos


    const { createVehicle, isLoading: isCreating } = useCreateVehicle();
    const { uploadImage, isUploading } = useImageUpload();
    const isSaving = isCreating || isUploading; // bloquea el botón mientras se sube la imagen o se guarda


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
            }, 2800); // la animación final dura ~2.6 s
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
        <>
            <div className={style['vehicle-form']}>
                <form className={style['form-container']} onSubmit={handleSubmit(insert)}>
                    <div className={style['container-container']}>
                        <div className={style["vechicle-containerfor"]}>
                            <h2>{t('vehicleForm.title')}</h2>
                            
                            {/* Fila 1: Placa y Marca */}
                            <div className={style['form-row']}>
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
                                    <label htmlFor="brandId">{t('vehicleForm.brand')}</label>
                                    <select
                                        id="brandId"
                                        {...register("brandId", {
                                            required: t('vehicleForm.requiredBrand'),
                                            onChange: () => setValue('modelId', ''),
                                        })}
                                        defaultValue="">
                                        <option value="" disabled>{t('vehicleForm.disabledBrand')}</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                    {errors.brandId && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.brandId.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Fila 2: Modelo y Precio */}
                            <div className={style['form-row']}>
                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="modelId">{t('vehicleForm.model')}</label>
                                    <select
                                        id="modelId"
                                        disabled={!selectedBrandId}
                                        {...register("modelId", { required: t("MaintenanceForm.requiredModel") })}
                                        defaultValue="">
                                        <option value="" disabled>
                                            {selectedBrandId ? t('vehicleForm.disabledModel') : t('vehicleForm.chooseBrandFirst')}
                                        </option>
                                        {brandModels.map((model) => (
                                            <option key={model.id} value={model.id}>{model.name}</option>
                                        ))}
                                    </select>
                                    {errors.modelId && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.modelId.message}
                                        </p>
                                    )}
                                    {catalogError && <p className={style['error-message']}><AiOutlineDashboard /> {catalogError}</p>}
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="price">{t("vehicleForm.price")}</label>
                                    <input
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
                                    {errors.price && (
                                        <p className={style['error-message']}>
                                            <AiOutlineDashboard /> {errors.price.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Fila 3: Kilometraje y Año */}
                            <div className={style['form-row']}>
                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor='mileage'>{t("vehicleForm.mileage")}</label>
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

                            {/* Fila 4: Capacidad y Categoría */}
                            <div className={style['form-row']}>
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
                                    <label htmlFor="vehicleType">{t('vehicleForm.Type')}</label>
                                    <input id="vehicleType" type="text" readOnly
                                        value={selectedModel?.category.name ?? ''}
                                        placeholder={t('vehicleForm.fromModel')} />
                                </div>
                            </div>

                            {/* Fila 5: Tipo de motor y Sucursal */}
                            <div className={style['form-row']}>
                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="fuelType">{t('vehicleForm.FuelType')}</label>
                                    <input id="fuelType" type="text" readOnly
                                        value={selectedModel?.engineType.name ?? ''}
                                        placeholder={t('vehicleForm.fromModel')} />
                                </div>

                                <div className={style['vehicle-form-input']}>
                                    <label htmlFor="branchId">{t('vehicleForm.branch')}</label>
                                    <select
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
                            </div>
                            {/* Botón dentro de la tarjeta: queda alineado al ancho de los campos */}
                            <div className={style['form-actions']}>
                                {submitError && <p className={style['error-message']}><AiOutlineDashboard /> {submitError}</p>}
                                <button className={style.save} type="submit" disabled={isSaving}>
                                    {isSaving ? t('vehicleForm.saving') : t('vehicleForm.saveVehicle')}
                                </button>
                                {/* mientras se sube/guarda corre en bucle; al terminar, una pasada final */}
                                {(isSaving || mos) && (
                                    <span className={style['vehicule-animation']}>
                                        <Animation key={isSaving ? 'saving' : 'done'} loop={isSaving} />
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className={style.fileDialogs}>
                            <FileDialog variant="card" invalid={Boolean(errors.vehicleImage)} onFileChange={handleFileChange} file={vehicleFile} />
                            {errors.vehicleImage && (<p className={style['error-message']}><AiOutlineDashboard />{errors.vehicleImage?.message}</p>)}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
export default VehicleForm;