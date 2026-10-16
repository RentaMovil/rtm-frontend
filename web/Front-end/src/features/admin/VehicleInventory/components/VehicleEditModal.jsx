import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AiOutlineDashboard } from "react-icons/ai";
import FileDialog from "../../../../shared/components/layout/FileDialog";
import { getValidVehicleYearRange, validateVehicleYear } from "../../../../shared/utils/calculateAge";
import style from "./VehicleEditModal.module.css";
import { useBranches } from "../../branches/hooks/useBranch";
import { useVehicleCatalog } from "../../registerVehicle/hooks/useVehicleCatalog";
import { vehicleService } from "../../registerVehicle/services/vehicleService";
import { VEHICLE_STATUS } from "../../registerVehicle/constans/vehicleStatus";
import { useImageUpload } from "../../../../shared/hooks/useImageUpload";

// Vehículo del inventario -> valores del formulario (los mismos nombres que usa toFleetVehiclePayload)
const toForm = (v) => ({
    brandId: v.brandId ?? "",
    modelId: v.modelId ?? "",
    plate: v.placa,
    branchId: v.branchId ?? "",
    mileage: v.km,
    age: v.año,
    price: v.precioDiario,
    capacity: v.capacidad,
});

const Field = ({ label, error, children }) => (
    <div className={style["vehicle-form-input"]}>
        <label>
            {label}
            {children}
        </label>
        {error && (
            <p className={style["error-message"]}>
                <AiOutlineDashboard /> {error.message}
            </p>
        )}
    </div>
);

// Editar un vehículo (HU-FLEET-005): PUT /vehicles/{id}. El estado no se edita aquí: el único cambio
// manual es retirarlo, y un vehículo nunca se elimina. Mantenimiento se maneja en su propia pantalla.
export default function VehicleEditModal({ vehicle, onClose, onSaved }) {
    const { t } = useTranslation();
    const { minYear, maxYear, currentYear } = getValidVehicleYearRange(1);
    const [vehicleFile, setVehicleFile] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmRetire, setConfirmRetire] = useState(false);

    const { branches } = useBranches();
    const { brands, models } = useVehicleCatalog();
    const { uploadImage, isUploading } = useImageUpload();

    const isRetired = vehicle.status === VEHICLE_STATUS.RETIRED;
    // Un vehículo rentado primero debe devolverse (Vehicle.INV-005)
    const canRetire = !isRetired && vehicle.status !== VEHICLE_STATUS.RENTED;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({ defaultValues: toForm(vehicle) });

    // Marcas, modelos y sucursales llegan después de abrir el modal: se rellena cuando ya hay opciones
    const catalogReady = models.length > 0 && branches.length > 0;
    useEffect(() => {
        if (catalogReady) reset(toForm(vehicle));
    }, [catalogReady, reset, vehicle]);

    const selectedBrandId = watch("brandId");
    const brandModels = models.filter((model) => String(model.brand.id) === String(selectedBrandId));
    const selectedModel = models.find((model) => String(model.id) === String(watch("modelId")));

    const onSubmit = async (data) => {
        setSubmitError(null);
        setIsSaving(true);
        try {
            let image = vehicle.imagen;
            if (vehicleFile) {
                image = await uploadImage(vehicleFile);
            }
            await vehicleService.update(vehicle.id, { ...data, image });
            onSaved?.();
            onClose();
        } catch (err) {
            setSubmitError(err.message || "No se pudo guardar el vehículo.");
        } finally {
            setIsSaving(false);
        }
    };

    const retire = async () => {
        setSubmitError(null);
        setIsSaving(true);
        try {
            await vehicleService.retire(vehicle.id);
            onSaved?.();
            onClose();
        } catch (err) {
            setSubmitError(err.message || "No se pudo retirar el vehículo.");
            setConfirmRetire(false);
        } finally {
            setIsSaving(false);
        }
    };

    const isBusy = isSaving || isUploading;

    return (
        <div className={style["modal-overlay"]} onClick={onClose}>
            <div className={style["modal-modal"]} onClick={(e) => e.stopPropagation()}>
                <div className={style["modal-header"]}>
                    <h3 className={style["modal-title"]}>{t("CheckStatus.modal.title")}</h3>
                    <button type="button" className={style["modal-closeButton"]} onClick={onClose} aria-label={t("CheckStatus.modal.close")}>
                        ×
                    </button>
                </div>

                <form className={style.modalForm} onSubmit={handleSubmit(onSubmit)} id="vehicle-edit-form">
                    {isRetired && <p className={style["error-message"]}>{t("CheckStatus.modal.retiredNotice")}</p>}

                    <fieldset disabled={isRetired} className={style["modal-fieldset"]}>
                        <section className={style["modal-section"]}>
                            <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.sections.general")}</h4>
                            <div className={style.modalFields}>
                                {/* La marca solo filtra los modelos: lo que se guarda es el modelo */}
                                <Field label={t("CheckStatus.modal.brand")} error={errors.brandId}>
                                    <select
                                        {...register("brandId", {
                                            required: t("vehicleForm.requiredBrand"),
                                            onChange: () => setValue("modelId", ""),
                                        })}
                                    >
                                        <option value="" disabled>{t("vehicleForm.disabledBrand")}</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label={t("vehicleForm.model")} error={errors.modelId}>
                                    <select
                                        disabled={!selectedBrandId}
                                        {...register("modelId", { required: t("MaintenanceForm.requiredModel") })}
                                    >
                                        <option value="" disabled>
                                            {selectedBrandId ? t("vehicleForm.disabledModel") : t("vehicleForm.chooseBrandFirst")}
                                        </option>
                                        {brandModels.map((model) => (
                                            <option key={model.id} value={model.id}>{model.name}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label={t("CheckStatus.modal.plate")} error={errors.plate}>
                                    <input
                                        className={style["modal-input"]}
                                        readOnly // la placa no se edita
                                        {...register("plate")}
                                    />
                                </Field>

                                <Field label={t("CheckStatus.modal.state")}>
                                    <input className={style["modal-input"]} readOnly value={vehicle.estado} />
                                </Field>
                            </div>
                        </section>

                        <section className={style["modal-section"]}>
                            <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.sections.technical")}</h4>
                            <div className={style.modalFields}>
                                <Field label={t("vehicleForm.price")} error={errors.price}>
                                    <input
                                        type="number"
                                        step="100"
                                        {...register("price", {
                                            required: t("vehicleForm.priceRequired"),
                                            valueAsNumber: true,
                                            min: { value: 0, message: t("vehicleForm.minLenghtPrice") },
                                            max: { value: 100000000, message: t("vehicleForm.maxLenghtPrice") },
                                        })}
                                    />
                                </Field>

                                <Field label={t("vehicleForm.mileage")} error={errors.mileage}>
                                    <input
                                        type="number"
                                        step="1000"
                                        {...register("mileage", {
                                            required: t("vehicleForm.mileageRequired"),
                                            valueAsNumber: true,
                                            min: { value: 0, message: t("vehicleForm.minLenghtMileage") },
                                            max: { value: 1000000, message: t("vehicleForm.maxLenghtMileage") },
                                        })}
                                    />
                                </Field>

                                <Field label={t("vehicleForm.age")} error={errors.age}>
                                    <input
                                        type="number"
                                        step="1"
                                        placeholder={`Ej: ${currentYear}`}
                                        {...register("age", {
                                            required: t("vehicleForm.ageRequired"),
                                            valueAsNumber: true,
                                            validate: (value) => {
                                                const r = validateVehicleYear(value, 1);
                                                if (r === "YEAR_TOO_LOW") return t("vehicleForm.minLenghtAge", { min: minYear });
                                                if (r === "YEAR_TOO_HIGH") return t("vehicleForm.maxLenghtAge", { max: maxYear });
                                                if (r === "INVALID_NUMBER") return t("vehicleForm.invalidAge");
                                                return true;
                                            },
                                        })}
                                    />
                                </Field>

                                <Field label={t("vehicleForm.capacity")} error={errors.capacity}>
                                    <input
                                        type="number"
                                        {...register("capacity", {
                                            required: t("vehicleForm.requiredCapacity"),
                                            min: { value: 1, message: t("vehicleForm.minLenghtCapacity") },
                                            max: { value: 100, message: t("vehicleForm.maxLenghtCapacity") },
                                        })}
                                    />
                                </Field>

                                {/* Categoría y motor son del modelo: se muestran, no se editan */}
                                <Field label={t("vehicleForm.Type")}>
                                    <input className={style["modal-input"]} readOnly
                                        value={selectedModel?.category.name ?? ""}
                                        placeholder={t("vehicleForm.fromModel")} />
                                </Field>

                                <Field label={t("vehicleForm.FuelType")}>
                                    <input className={style["modal-input"]} readOnly
                                        value={selectedModel?.engineType.name ?? ""}
                                        placeholder={t("vehicleForm.fromModel")} />
                                </Field>
                            </div>
                        </section>

                        <section className={style["modal-section"]}>
                            <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.ubication")}</h4>
                            <div className={style.modalFields}>
                                <Field label={t("CheckStatus.modal.ubication")} error={errors.branchId}>
                                    <select {...register("branchId", { required: t("CheckStatus.modal.requiredUbication") })}>
                                        <option value="" disabled>{t("CheckStatus.modal.ubication")}</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </section>

                        <section className={style["modal-section"]}>
                            <h4 className={style["modal-section-title"]}>{t("CheckStatus.modal.sections.image")}</h4>
                            <div className={style.modalFileDialogWrapper}>
                                <FileDialog onFileChange={setVehicleFile} file={vehicleFile || vehicle.imagen} />
                            </div>
                        </section>
                    </fieldset>

                    {submitError && (
                        <p className={style["error-message"]}>
                            <AiOutlineDashboard /> {submitError}
                        </p>
                    )}
                </form>

                <div className={style["modal-footer"]}>
                    {/* Retirar es irreversible: pide confirmación */}
                    {canRetire && !confirmRetire && (
                        <button type="button" className={style["modal-retireButton"]} onClick={() => setConfirmRetire(true)} disabled={isBusy}>
                            {t("CheckStatus.modal.retire")}
                        </button>
                    )}
                    {confirmRetire && (
                        <>
                            <span>{t("CheckStatus.modal.retireConfirm")}</span>
                            <button type="button" className={style["modal-retireButton"]} onClick={retire} disabled={isBusy}>
                                {t("CheckStatus.modal.retireYes")}
                            </button>
                        </>
                    )}
                    <button type="button" className={style["modal-cancelButton"]} onClick={confirmRetire ? () => setConfirmRetire(false) : onClose} disabled={isBusy}>
                        {t("CheckStatus.modal.cancel")}
                    </button>
                    {!confirmRetire && !isRetired && (
                        <button type="submit" form="vehicle-edit-form" className={style["modal-submitButton"]} disabled={isBusy}>
                            {isBusy ? t("CheckStatus.actions.saving") : t("CheckStatus.actions.save")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
