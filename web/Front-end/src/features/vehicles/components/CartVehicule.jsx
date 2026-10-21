import './CartVehicule.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";

function CartVehicule({ vehicle, rentalSearch, showActions = true }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    if (!vehicle) return null;

    // Número crudo para los cálculos (reserva, total); el formateo con
    // separador de miles es solo cosmético, se aplica al mostrarlo, no antes.
    // Pasar la versión ya formateada rompía Number(price) río abajo: "4.700"
    // se interpreta como 4.7 (el punto se lee como decimal, no como millar).
    const price = vehicle.dailyPrice;
    const formattedPrice = price.toLocaleString("es-CO");

    const handleContinue = () => {
        if (!showActions) return;

        // Catálogo público; reservar sí exige sesión.
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        navigate("/Reservation", {
            state: {
                vehicle,
                img: vehicle.imageUrl,
                name: vehicle.name,
                price,
                branch: vehicle.branchName,
                model: vehicle.modelName,
                type: vehicle.categoryName,
                engineType: vehicle.engineTypeName,
                capacity: vehicle.capacity,
                rentalSearch,
            },
        });
    };
//--/--/--/--/--------------------
//--/--/----------------------
//--/------------------------

    return (
        <div className="card-vehicule">
            <div className="car-img">
                <img src={vehicle.imageUrl} alt={vehicle.name} />
            </div>
            <div className="car-info">
                <h3>{vehicle.name}</h3>
                <p className="car-type">{vehicle.categoryName || t("vehicles.categoryUnavailable")}</p>

                <div className="features">
                    <p><span className='text-box'>{t("vehicles.model")} </span>{vehicle.modelName}</p>
                    <p><span className='text-box'>{t("vehicles.capacity")} </span>{vehicle.capacity}</p>
                    <p><span className='text-box'>{t("vehicles.engine")} </span>{vehicle.engineTypeName || t("vehicles.notAvailable")}</p>
                </div>

                <div className="benefits">
                    <span>✓ {vehicle.status}</span>
                    <span>{vehicle.year}</span>
                    <span>{Number(vehicle.mileage || 0).toLocaleString("es-CO")} km</span>
                </div>

                {vehicle.branchName && (
                    <div className='location-container'>
                        <div className='location-box'><p className='location-text'>✈️</p></div>
                        <div className='location-box'><p className='location-text'> {vehicle.branchName} </p></div>
                    </div>
                )}
            </div>
            <div className="car-price">
                <p className="price">${formattedPrice}</p>
                <span className="free">{t('cartVehicule.cancellation')}</span>
                {showActions && (
                    <button type="button" onClick={handleContinue}>{t('cartVehicule.continue')}</button>
                )}
            </div>
        </div>
    );
}

export default CartVehicule;