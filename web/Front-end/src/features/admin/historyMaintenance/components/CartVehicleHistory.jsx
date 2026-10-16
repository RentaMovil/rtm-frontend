import carImg from "../../../../assets/carro.png";
import { useTranslation } from "react-i18next";
import statusStyle from '../../historyMaintenance/components/CartVehicleHistory.module.css';
import { MAINTENANCE_STATUS_KEY } from '../../maintenance/constans/maintenanceStatus';
import { formatDate } from '../../maintenance/service/maintenanceMapper';

function CartVehicleHistory({ record = {}, onViewMore }) {
    const { t } = useTranslation();
    const { location, plate, date, typeMaintenance, status, description, image: recordImg, modelName, cost } = record;

    const stateClass = {
        SCHEDULED: statusStyle['state--mantenimiento'],
        IN_PROGRESS: statusStyle['state--en-uso'],
        COMPLETED: statusStyle['state--disponible'],
        CANCELLED: statusStyle['state--reservado'],
    }[status] || '';

    const stateLabel = MAINTENANCE_STATUS_KEY[status]
        ? t(`CartVehiculeMaintenance.${MAINTENANCE_STATUS_KEY[status]}`)
        : status;

    // startDate es solo fecha (yyyy-mm-dd): formatDate evita que se corra un día por la zona horaria
    const formattedDate = date ? formatDate(date) : 'Sin fecha';
    const imgSrc = recordImg || carImg;

    return (
        <div className={statusStyle['card-vehicule']}>
            <div className={statusStyle['img-car-vehicule']}>
                <img src={imgSrc} alt={`${modelName || 'Vehículo'}`} />
            </div>

            <div className={statusStyle['text-vehicule']}>
                <h3 className={statusStyle['name-car-vehicule']}>
                    {modelName || 'Vehículo'}
                    {<span className={statusStyle['model-vehicule']}>{plate}</span>}
                </h3>

                {description && <p className={statusStyle['desc-vehicule']}>{description}</p>}

                <div className={statusStyle['container-info']}>
                    <div className={statusStyle['info-item']}>
                        <span className={statusStyle['info-label']}>{t("CheckStatus.modal.plate")}</span>
                        <span className={statusStyle['plate']}>{plate}</span>
                    </div>

                    {typeMaintenance && (
                        <div className={statusStyle['info-item']}>
                            <span className={statusStyle['info-label']}>{t("CartVehiculeStatus.Maintenance")}</span>
                            <span className={statusStyle['info-value']}>{typeMaintenance}</span>
                        </div>
                    )}

                    {formattedDate && (
                        <div className={statusStyle['info-item']}>
                            <span className={statusStyle['info-label']}>{t("maintenanceForm.date") || 'Fecha'}</span>
                            <span className={statusStyle['info-value']}>{formattedDate}</span>
                        </div>
                    )}

                    {cost != null && (
                        <div className={statusStyle['info-item']}>
                            <span className={statusStyle['info-label']}>{t("History.cost")}</span>
                            <span className={statusStyle['info-value']}>$ {Number(cost).toLocaleString("es-CO")}</span>
                        </div>
                    )}

                    {location && (
                        <div className={statusStyle['info-item']}>
                            <span className={statusStyle['info-label']}>{t("CheckStatus.modal.ubication")}</span>
                            <span className={statusStyle['info-value']}>{location}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={statusStyle['card-actions']}>
                <span className={`${statusStyle['state-badge']} ${stateClass}`}>{stateLabel}</span>
                <button className={statusStyle['btn-ver-mas']} onClick={() => onViewMore && onViewMore(record)}>
                    {t("CartVehiculeMaintenance.seeMore")}
                </button>
            </div>
        </div>
    );
}

export default CartVehicleHistory;