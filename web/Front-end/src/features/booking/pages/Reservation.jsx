import "./Reservation.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useRef, useState } from "react";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { RoleNavbar, RoleFooter } from "../../../shared/components/layout/RoleChrome";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";
import { useBranches } from "../../admin/branches/hooks/useBranch";
import FilterCalendar from "../../vehicles/components/FilterCalendar";
import MapComponent from "../components/MapComponents";
import { useReservationForm } from "../hooks/useReservationForm";
import InsuranceSelector from "../components/InsuranceSelector";
import VehicleReservationCard from "../components/VehicleReservationCard";
import TermsAndConditions from "../components/TermsAndConditions";

import { useReservation } from "../context/ReservationContext";
import { useDialog } from "../../../shared/components/dialog/dialogContext";
import { useInsurance } from "../../admin/insuranceTypes/hooks/useInsurance";
import {
    createTermsAcceptance,
    isValidTermsAcceptance,
} from "../data/rentalTerms";

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function Reservation() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const filterCalendarRef = useRef(null);
    const { alert } = useDialog();
    const { user } = useAuth();
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);
    const NavbarComponent = isAdmin ? NavbarAdmin : Navbar;
    const FooterComponent = isAdmin ? FooterAdmin : Footer;

    const {
        vehicle: rawVehicle,
        img,
        name,
        price,
        branch,
        model,
        type,
        door,
        capacity,
        beneficios,
        rentalSearch,
    } = location.state || {};

    // Identificador real del Vehicle (Reservation.vehicleId, ver
    // types/reservation.ts / types/vehicle.ts). CartVehicule.jsx pasa el
    // objeto `vehicle` completo (mock: vehicle_id) dentro de location.state;
    // sin este id, canCreateReservation en usePaymentForm nunca es true y el
    // botón de pago queda deshabilitado permanentemente.
    const vehicleId =
        rawVehicle?.vehicle_id ??
        rawVehicle?.vehicleId ??
        rawVehicle?.id ??
        null;

    const isMobile = useIsMobile(768);

    const { branches } = useBranches();
    const { insurance } = useInsurance();

    const {
        reservation,
        updateReservation,
    } = useReservation();

    const selectedInsurance = insurance.find(
        ({ id }) => id === reservation?.insuranceId
    );

    const [termsAccepted, setTermsAccepted] = useState(() =>
        isValidTermsAcceptance(reservation?.termsAcceptance)
    );

    const {
        selectedBranch,
        setSelectedBranch,
        pickupBranch,
        pickupDate,
        returnDate,
        days,
        total,
        showFilters,
        toggleShowFilters,
    } = useReservationForm(
        price,
        navigate,
        t,
        branch,
        rentalSearch
    );

    const finalPickupBranch = pickupBranch ?? branch;
    const finalReturnBranch =
        selectedBranch ?? finalPickupBranch;

    // Igual que el backend (InsuranceType.costFor): selectedInsurance.price es el costo
    // DIARIO del seguro (daily_cost) y se cobra una vez por toda la duración de la
    // reserva (dailyCost * days), no como un monto plano.
    const reservationTotal =
        Number(total) + Number(selectedInsurance?.price ?? 0) * Number(days || 0);

    const currentCalendarValue = {
        branch: pickupBranch,
        startDate: pickupDate,
        endDate: returnDate,
    };

    const handleTermsAcceptanceChange = (accepted) => {
        setTermsAccepted(accepted);

        // Si se desmarca una aceptación previa, la ruta de pago tampoco
        // debe conservar una autorización antigua para esta reserva.
        if (!accepted) {
            updateReservation({ termsAcceptance: null });
        }
    };

    /**
     * Guarda toda la información necesaria de la reserva
     * antes de enviar al usuario al módulo de Payment.
     */
    const handlePaymentWithReservation = () => {
        if (!pickupDate || !returnDate) {
            alert({ message: t("reservation.selectDates"), tone: "warning" });
            return;
        }

        if (!termsAccepted) {
            alert({ message: t("terms.acceptError"), tone: "warning" });
            return;
        }

        updateReservation({
            vehicle: {
                vehicleId,
                img,
                name,
                price,
                branch: finalPickupBranch,
                model,
                type,
                door,
                capacity,
                beneficios,
            },

            pickupBranch: finalPickupBranch,
            returnBranch: finalReturnBranch,

            pickupDate,
            returnDate,

            termsAcceptance: createTermsAcceptance(),
        });

        navigate("/Payment");
    };

    /**
     * Actualiza la búsqueda del calendario
     * y regresa al Home para mostrar los nuevos resultados.
     */
    const handleCalendarChange = (nextState) => {
        const updatedBranch =
            nextState.branch !== undefined
                ? nextState.branch
                : pickupBranch;

        const updatedStartDate =
            nextState.startDate !== undefined
                ? nextState.startDate
                : pickupDate;

        const updatedEndDate =
            nextState.endDate !== undefined
                ? nextState.endDate
                : returnDate;

        navigate("/Home", {
            state: {
                rentalSearch: {
                    branch: updatedBranch,
                    startDate: updatedStartDate,
                    endDate: updatedEndDate,
                },
                triggerSearch: "true",
            },
        });
    };

    if (!name) {
        return <p>No hay vehículo seleccionado</p>;
    }

    return (
        <>
            <RoleNavbar />

            <div className="containerR">

                <div className="calendar-top">

                    {isMobile && (
                        <button
                            type="button"
                            className="filter-toggle"
                            onClick={toggleShowFilters}
                        >
                            {showFilters
                                ? "Ocultar filtros ▲"
                                : "Mostrar filtros ▼"}
                        </button>
                    )}

                    {(!isMobile || showFilters) && (
                        <FilterCalendar
                            ref={filterCalendarRef}
                            onSearch={handleCalendarChange}
                            variant="normal"
                            value={currentCalendarValue}
                            onChange={handleCalendarChange}
                        />
                    )}

                </div>

                <div className="contentR">

                    <div className="leftR">

                        <VehicleReservationCard
                            vehicle={{
                                img,
                                name,
                                price,
                                branch: pickupBranch ?? branch,
                                model,
                                type,
                                door,
                                capacity,
                                beneficios,
                            }}
                        />

                        <div className="card-location">
                            <div className="reservation-section-header">
                                <span className="reservation-section-dot" aria-hidden="true" />
                                <h3 className="reservation-section-title">
                                    Cambie la sucursal de recogida:
                                </h3>
                            </div>

                            <div className="info-location">

                                {/* Sucursal de recogida */}
                                <div className="side-r">

                                    <p className="info-brand">
                                        <FaMapMarkerAlt className="icon-location" />
                                        Sucursal de recogida:
                                    </p>

                                    <div className="card-address-box">

                                        <strong className="branch-name">
                                            {pickupBranch?.name ??
                                                branch?.name ??
                                                "Sucursal"}
                                        </strong>

                                        <p className="branch-street">
                                            {pickupBranch?.address ??
                                                pickupBranch?.direccion ??
                                                branch?.address ??
                                                branch?.direccion ??
                                                "Dirección no disponible"}
                                        </p>

                                    </div>

                                </div>

                                {/* Sucursal de entrega */}
                                <div className="side-left">

                                    <p className="info-brand">
                                        <FaMapMarkerAlt className="icon-location" />
                                        Sucursal de entrega:
                                    </p>

                                    {selectedBranch ? (
                                        <div className="card-address-box">

                                            <strong className="branch-name">
                                                {selectedBranch.name}
                                            </strong>

                                            <p className="branch-street">
                                                {selectedBranch.address ??
                                                    selectedBranch.direccion ??
                                                    "Dirección no disponible"}
                                            </p>

                                        </div>
                                    ) : (
                                        <div className="card-address-box empty">

                                            <p className="branch-street">
                                                Misma sucursal de recogida
                                            </p>

                                        </div>
                                    )}

                                </div>

                            </div>

                            <MapComponent
                                mode="select"
                                branches={branches}
                                selectedBranch={selectedBranch}
                                setSelectedBranch={setSelectedBranch}
                            />

                        </div>

                    </div>

                    {/* Resumen */}
                    <div className="rightR">

                        <div className="card-summary">

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handlePaymentWithReservation();
                                }}
                            >

                                <div className="reservation-section-header">
                                    <span className="reservation-section-dot" aria-hidden="true" />
                                    <h3 className="reservation-section-title">
                                        {t("reservation.summary")}
                                    </h3>
                                </div>

                                <p>
                                    {days} {t("reservation.days")} × ${price}
                                </p>

                                <p>
                                    {selectedInsurance
                                        ? `Seguro: ${selectedInsurance.name} — $${Number(
                                            selectedInsurance.price
                                        ).toLocaleString("es-CO")}`
                                        : t("reservation.sure")}
                                </p>

                                <h4>
                                    {t("reservation.total")} ${reservationTotal}
                                </h4>

                                <InsuranceSelector />

                                <TermsAndConditions
                                    accepted={termsAccepted}
                                    onAcceptChange={handleTermsAcceptanceChange}
                                    vehicle={{ name }}
                                    pickupDate={pickupDate}
                                    returnDate={returnDate}
                                    pickupBranch={finalPickupBranch}
                                    returnBranch={finalReturnBranch}
                                    total={reservationTotal}
                                />

                                <button
                                    className="btn-booking"
                                    type="submit"
                                    disabled={!termsAccepted}
                                    aria-disabled={!termsAccepted}
                                >
                                    {t("reservation.submit")}
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

            <RoleFooter />
        </>
    );
}

export default Reservation;
