import { useCallback, useEffect, useState } from "react";
import { reservationService } from "../services/reservationService";
import { toReservationViewModel } from "../services/reservationMapper";
import { carsService } from "../../vehicles/Services/carsService";
import { branchService } from "../../admin/branches/services/branchService";
import { insuranceService } from "../../admin/insuranceTypes/services/insuranceService";
// Lista de una petición opcional: si el servicio todavía no existe o falla, queda vacía
const listOrEmpty = (result) =>
    result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [];

export function useReservationsList() {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReservations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Las reservas son obligatorias; sucursales y seguros solo agregan
            // nombres y precios, así que si alguno falla la lista se muestra igual.
            const [reservationsResponse, optional] = await Promise.all([
                reservationService.getMine(),
                Promise.allSettled([branchService.getAll(), insuranceService.getAll()]),
            ]);
            const [branchesResponse, insuranceResponse] = optional.map(listOrEmpty);

            // carsService.getAll() solo trae vehículos AVAILABLE: el de una reserva ya
            // confirmada normalmente no lo está. Se trae cada vehículo por su id
            // (getById no filtra por estado) en vez de depender del catálogo público.
            const vehicleIds = [...new Set(reservationsResponse.map((r) => r.vehicle_id))];
            const vehiclesResults = await Promise.allSettled(vehicleIds.map((id) => carsService.getById(id)));
            const vehiclesById = Object.fromEntries(
                vehiclesResults
                    .filter((result) => result.status === "fulfilled")
                    .map((result) => [result.value.id, result.value])
            );
            const branchesById = Object.fromEntries(branchesResponse.map((b) => [b.id, b]));
            const insuranceById = Object.fromEntries(insuranceResponse.map((i) => [i.id, i]));

            setReservations(
                reservationsResponse.map((r) =>
                    toReservationViewModel(r, { vehiclesById, branchesById, insuranceById })
                )
            );
        } catch (err) {
            setError(err.message || "No fue posible cargar las reservas.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchReservations(); }, [fetchReservations]);

    return { reservations, isLoading, error, refetch: fetchReservations };
}