import './CartVehicule.css'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";


function CartVehicule({img,name,model,price, branch,type, door, capacity, rentalSearch}){
    const {t} = useTranslation();
    const navigate = useNavigate();
    return(
<div className="card-vehicule">
    <div className="car-img">
        <img src={img} alt={name} />
    </div>
    {/* CENTRO - INFO */}
    <div className="car-info">
        <h3>{name}</h3>
        <p className="car-type">{type}</p>

        <div className="features">
            <p><span className='text-box'>Modelo: </span>{model}</p>
            <p><span className='text-box'>Capacidad: </span>{capacity}</p>
            <span>🧳{door}</span>
        </div>

        <div className='location-container'>
            <div className='location-box'>
                <p className='location-text'>✈️</p> 
            </div>
            <div className='location-box'>
                <p className='location-text'> {branch?.name} </p> 
            </div>
        </div>
    </div>
    <div className="car-price">
        <p className="price">${price}</p>
        <button onClick={() => navigate("/reservation", {
            state: { img, name, price, branch, model, type, door, capacity, rentalSearch }
        })}>{t('cartVehicule.continue')}</button>
    </div>

</div>
    )
}
export default CartVehicule;
