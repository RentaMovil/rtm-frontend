import { useState } from "react";
import { useTranslation } from "react-i18next";
import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from '../../../../shared/components/layout/FooterAdmin';
import CartVehiculeStatus from "../components/CartVehiculeStatus";
import FiltrerStatus from "../components/FiltrerStatus";
import FleetChart from "../components/FleetChart";
import style from "../pages/CheckStatus.module.css";
import FileDialog from "../../../../shared/components/layout/FileDialog";
import { useForm } from "react-hook-form";
import { AiOutlineDashboard } from "react-icons/ai";
import { getValidVehicleYearRange, validateVehicleYear } from '../../../../shared/utils/calculateAge';
import { useStatus } from "../hooks/useStatus.js";
import { useDeleteStatus } from "../hooks/useDeleteStatus.js";
import { useUpdateStatus } from "../hooks/useUpdateStatus.js";
import { useImageUpload } from "../../../../shared/hooks/useImageUpload";

function CheckStatus() {
    const { t } = useTranslation();
    const [query, setSearch] = useState("");
    const [filterState, setFilterState] = useState("all");
    const { register, formState: { errors }, handleSubmit, reset } = useForm();
    const [vehicleFile, setVehicleFile] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const { minYear, maxYear, currentYear } = getValidVehicleYearRange(1);

    const { vehicles, refetch } = useStatus();
    const { updateStatusVehicle, isLoading } = useUpdateStatus();
    const { deleteStatusVehicle } = useDeleteStatus();
    const { uploadImage, isUploading } = useImageUpload();

    const stateNameMap = {
        all: null,
        available: "Disponible",
        maintenance: "En mantenimiento",
        inUse: "En uso",
        reserved: "Reservado",
    };

    const filteredVehicles = vehicles
        .filter((v) => filterState === "all" || v.status === stateNameMap[filterState])
        .filter((v) => {
            const vehicleName = [v.brandName, v.modelName].filter(Boolean).join(" ").toLowerCase();
            const plate = String(v.plate || "").toLowerCase();
            const searchTerm = query.toLowerCase();
            return vehicleName.includes(searchTerm) || plate.includes(searchTerm);
        });

    const handleFileChange = (file) => {
        setVehicleFile(file);
    };

    const openEditModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        reset({
            brandName: vehicle.brandName,
            plate: vehicle.plate,
            model: vehicle.modelName,
            state: vehicle.status,
            branchName: vehicle.branchName,
            description: vehicle.description,
            mileage: vehicle.mileage,
            age: vehicle.age,
            price: vehicle.dailyPrice,
            fuelType: vehicle.engineTypeName,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType,
        });
        setVehicleFile(vehicle.imageUrl || null);
    };

    const closeModal = () => {
        setSelectedVehicle(null);
        reset();
        setVehicleFile(null);
    };

    const onSubmit = async (data) => {
        if (!selectedVehicle) return;

        try {
            let imageUrl = selectedVehicle.imageUrl;
            if (vehicleFile instanceof File) {
                imageUrl = await uploadImage(vehicleFile);
            }

            // Por id (entero), no por placa: la placa ya no es el id del vehículo
            await updateStatusVehicle(selectedVehicle.id, { ...data, image: imageUrl });
            await refetch();
            closeModal();
        } catch (error) {
            console.error('Error al actualizar el vehículo:', error);
        }
    };

    const handleDelete = async (vehicle) => {
        try {
            await deleteStatusVehicle(vehicle.plate);
            await refetch();
        } catch (error) {
            console.error('Error al eliminar el vehículo:', error);
        }
    };

    return (
        <>
            <NavBarAdmin />
            <h2 className={style["status-h2"]}>{t("CheckStatus.checkStatus")}</h2>

            <div className={style["card-check"]}>
                <div className={style["card-container-left"]}>
                    <div className={style["card-container-setSearch"]}>
                        <FiltrerStatus query={query} setSearch={setSearch} filterState={filterState} setFilterState={setFilterState} />
                    </div>
                    <div className={style["card-container-fleetc"]}>
                        <FleetChart vehicles={vehicles} />
                    </div>
                </div>
                <div className={style["card-container-right"]}>
                    <div className={style["card-container-status"]}>
                        {filteredVehicles.map((vehicle) => (
                            <CartVehiculeStatus
                                key={vehicle.plate}
                                brandName={vehicle.brandName}
                                modelName={vehicle.modelName}
                                status={vehicle.status}
                                branchName={vehicle.branchName}
                                dailyPrice={vehicle.dailyPrice}
                                engineTypeName={vehicle.engineTypeName}
                                mileage={vehicle.mileage}
                                age={vehicle.age}
                                plate={vehicle.plate}
                                imageUrl={vehicle.imageUrl}
                                description={vehicle.description}
                                onVerMas={() => openEditModal(vehicle)}
                                onDelete={() => handleDelete(vehicle)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {selectedVehicle && (
                <div className={style["modal-overlay"]} onClick={closeModal}>
                    <div className={style["modal-modal"]} onClick={(e) => e.stopPropagation()}>
                        <div className={style["modal-header"]}>
                            <h3 className={style["modal-title"]}>{t("CheckStatus.modal.title")}</h3>
                            <button type="button" className={style["modal-closeButton"]} onClick={closeModal} aria-label={t("CheckStatus.modal.close")}>×</button>
                        </div>

                        <div className={style.modalForm}>
                            <section className={style["modal-section"]}>
                                <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.sections.general")}</h4>
                                <div className={style.modalFields}>
                                    <div className={style['vehicle-form-input']}>
                                        <label>
                                            {t("CheckStatus.modal.brand")}
                                            <input
                                                className={style["modal-input"]}
                                                {...register("brandName", {
                                                    required: t("CheckStatus.modal.requiredName"),
                                                    minLength: { value: 3, message: t("CheckStatus.modal.requiredNameMinLength") },
                                                    maxLength: { value: 50, message: t("CheckStatus.modal.requiredNameMaxLength") },
                                                    pattern: { value: /^[A-Za-z0-9\s\-]{2,30}$/, message: t("CheckStatus.modal.formatInvalid") }
                                                })}
                                            />
                                            {errors.brandName && <p className={style['error-message']}><AiOutlineDashboard /> {errors.brandName.message}</p>}
                                        </label>
                                    </div>

                                    <div className={style['vehicle-form-input']}>
                                        <label htmlFor="model">{t('vehicleForm.model')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('vehicleForm.placeholderModel')}
                                            {...register("model", {
                                                required: t("MaintenanceForm.requiredModel"),
                                                minLength: { value: 2, message: t("MaintenanceForm.requiredModelMinLength") },
                                                maxLength: { value: 30, message: t("MaintenanceForm.requiredModelMinLength") },
                                                pattern: { value: /^[A-Za-z0-9\s\-]{2,30}$/, message: t('vehicleForm.invalidModel') }
                                            })}
                                        />
                                        {errors.model && <p className={style['error-message']}><AiOutlineDashboard /> {errors.model.message}</p>}
                                    </div>

                                    <div className={style['vehicle-form-input']}>
                                        <label>
                                            {t("CheckStatus.modal.plate")}
                                            <input
                                                className={style["modal-input"]}
                                                {...register("plate", {
                                                    required: t("CheckStatus.modal.requiredPlate"),
                                                    minLength: { value: 2, message: t("CheckStatus.modal.requiredPlateMinLength") },
                                                    maxLength: { value: 30, message: t("CheckStatus.modal.requiredPlateMaxLength") },
                                                    pattern: { value: /^[A-Z]{3}[0-9]{2}[A-Z0-9]?$/, message: t("CheckStatus.modal.formatInvalidPlate") },
                                                    onChange: (e) => { e.target.value = e.target.value.toUpperCase() }
                                                })}
                                            />
                                            {errors.plate && <p className={style['error-message']}><AiOutlineDashboard /> {errors.plate.message}</p>}
                                        </label>
                                    </div>

                                    <div className={style['vehicle-form-input']}>
                                        <label>
                                            {t("CheckStatus.modal.state")}
                                            <select {...register("state")}>
                                                <option value="Disponible">{t("CheckStatus.modal.stateOptions.available")}</option>
                                                <option value="En mantenimiento">{t("CheckStatus.modal.stateOptions.maintenance")}</option>
                                                <option value="En uso">{t("CheckStatus.modal.stateOptions.inUse")}</option>
                                                <option value="Reservado">{t("CheckStatus.modal.stateOptions.reserved")}</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            <section className={style["modal-section"]}>
                                <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.sections.technical")}</h4>
                                <div className={style.modalFields}>
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
                                        {errors.price && <p className={style['error-message']}><AiOutlineDashboard /> {errors.price.message}</p>}
                                    </div>

                                    <div className={style['vehicle-form-input']}>
                                        <label htmlFor='mileage'>{t("vehicleForm.mileage")}</label>
                                        <input
                                            type="number"
                                            id="mileage"
                                            step="1000"
                                            {...register('mileage', {
                                                required: t("vehicleForm.mileageRequired"),
                                                valueAsNumber: true,
                                                min: { value: 0, message: t("vehicleForm.minLenghtMileage") },
                                                max: { value: 1000000, message: t("vehicleForm.maxLenghtMileage") }
                                            })}
                                        />
                                        {errors.mileage && <p className={style['error-message']}><AiOutlineDashboard /> {errors.mileage.message}</p>}
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
                                                    if (validationResult === 'YEAR_TOO_LOW') return t("vehicleForm.minLenghtAge", { min: minYear }) || `El año debe ser mayor a ${minYear}`;
                                                    if (validationResult === 'YEAR_TOO_HIGH') return t("vehicleForm.maxLenghtAge", { max: maxYear }) || `El año no puede superar ${maxYear}`;
                                                    if (validationResult === 'INVALID_NUMBER') return t("vehicleForm.invalidAge") || "Ingresa un año válido";
                                                    return true;
                                                }
                                            })}
                                        />
                                        {errors.age && <p className={style['error-message']}><AiOutlineDashboard /> {errors.age.message}</p>}
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
                                        {errors.capacity && <p className={style['error-message']}><AiOutlineDashboard /> {errors.capacity.message}</p>}
                                    </div>

                                    <div className={style['vehicle-form-input']}>
                                        <label htmlFor="type">{t('vehicleForm.Type')}</label>
                                        <select
                                            {...register("vehicleType", {
                                                required: t('vehicleForm.requiredType'),
                                                validate: value => value !== "" || t('vehicleForm.requiredType')
                                            })}
                                            defaultValue="">
                                            <option value="" disabled>{t('vehicleForm.disabledType')}</option>
                                            <optgroup label={t('vehicleForm.labelType1')}>
                                                <option value="Sedán">Sedán</option>
                                                <option value="Hatchback">Hatchback</option>
                                                <option value="SUV">SUVs</option>
                                                <option value="Camioneta">Camioneta</option>
                                                <option value="Pickup">Pickup</option>
                                                <option value="Van">Van</option>
                                                <option value="Coupé">Coupé</option>
                                            </optgroup>
                                            <optgroup label={t('vehicleForm.labelType2')}>
                                                <option value="Camión">{t('vehicleForm.cargaType1')}</option>
                                                <option value="Tractocamión">{t('vehicleForm.cargaType2')}</option>
                                                <option value="Furgón">{t('vehicleForm.cargaType3')}</option>
                                            </optgroup>
                                        </select>
                                        {errors.vehicleType && <p className={style['error-message']}><AiOutlineDashboard /> {errors.vehicleType.message}</p>}
                                    </div>

                                    <div className={style['vehicle-form-input']}>
                                        <label htmlFor="fuelType">{t('vehicleForm.FuelType')}</label>
                                        <select
                                            {...register("fuelType", {
                                                required: t('vehicleForm.requiredFuelType'),
                                                validate: value => value !== "" || t('vehicleForm.requiredFuelType')
                                            })}
                                            defaultValue="">
                                            <option value="" disabled>{t('vehicleForm.disabledFuelType')}</option>
                                            <option value="Gasolina">{t('vehicleForm.fuelType1')}</option>
                                            <option value="Diésel">{t('vehicleForm.fuelType2')}</option>
                                            <option value="Eléctrico">{t('vehicleForm.fuelType4')}</option>
                                            <option value="Híbrido">{t('vehicleForm.fuelType3')}</option>
                                            <option value="Gas natural">{t('vehicleForm.fuelType5')}</option>
                                            <option value="Gas propano">{t('vehicleForm.fuelType6')}</option>
                                        </select>
                                        {errors.fuelType && <p className={style['error-message']}><AiOutlineDashboard /> {errors.fuelType.message}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className={style["modal-section"]}>
                                <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.sections.location")}</h4>
                                <div className={style.modalFields}>
                                    <div className={style['vehicle-form-input']}>
                                        <label>
                                            {t("CheckStatus.modal.ubication")}
                                            <input
                                                className={style["modal-input"]}
                                                {...register("branchName", {
                                                    required: t("CheckStatus.modal.requiredUbication"),
                                                    minLength: { value: 2, message: t("CheckStatus.modal.requiredUbicationMinLength") },
                                                    maxLength: { value: 100, message: t("CheckStatus.modal.requiredUbicationMaxLength") },
                                                    pattern: { value: /^[A-Za-zÀ-ÿ0-9\s\.\,\#\-]{2,100}$/, message: t("CheckStatus.modal.formatInvalidUbication") }
                                                })}
                                            />
                                            {errors.branchName && <p className={style['error-message']}><AiOutlineDashboard /> {errors.branchName.message}</p>}
                                        </label>
                                    </div>

                                    <label className={style['vehicle-form-input--full']}>
                                        {t("CheckStatus.modal.description")}
                                        <textarea
                                            className={style["modal-textarea"]}
                                            {...register("description", {
                                                minLength: { value: 5, message: t("CheckStatus.modal.requiredDescriptionMinLength") },
                                                maxLength: { value: 200, message: t("CheckStatus.modal.requiredDescriptionMaxLength") }
                                            })}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                        />
                                        {errors.description && <p className={style['error-message']}><AiOutlineDashboard /> {errors.description.message}</p>}
                                    </label>
                                </div>
                            </section>

                            <section className={style["modal-section"]}>
                                <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.sections.image")}</h4>
                                <div className={style.modalFileDialogWrapper}>
                                    <FileDialog className={style["modal-fileDialog"]} onFileChange={handleFileChange} file={vehicleFile} />
                                </div>
                            </section>
                        </div>

                        <div className={style["modal-footer"]}>
                            <button type="button" className={style["modal-cancelButton"]} onClick={closeModal}>
                                {t("CheckStatus.modal.cancel")}
                            </button>
                            <button type="button" className={style["modal-submitButton"]} onClick={() => handleSubmit(onSubmit)()} disabled={isLoading || isUploading}>
                                {(isLoading || isUploading) ? t("CheckStatus.actions.saving") : t("CheckStatus.actions.save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FooterAdmin />
        </>
    );
}

export default CheckStatus;