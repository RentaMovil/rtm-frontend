import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from '../../../../shared/components/layout/FooterAdmin';
import VehicleForm from "../components/VehicleForm";
import style from'./RegisterVehicle.module.css';
function RegisterVehicle() {
    return (
        <>
            <NavBarAdmin/>
            <VehicleForm />
            <FooterAdmin/>

        </>
    );
}
export default RegisterVehicle;