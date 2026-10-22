import { httpClient } from '../../../../shared/api/httpClient';
import { toLocationViewModel } from "./locationMapper";
import { rentalService } from "../../../booking/services/rentalService";
import { reservationService } from "../../../booking/services/reservationService";
import { inventoryService } from "../../VehicleInventory/services/inventoryService";

export const locationService = {
    // Vehículos con rental IN_PROGRESS + su última posición conocida.
    // No existe un endpoint compuesto en el modelo, así que se arma
    // cruzando colecciones — mismo patrón que useReservationsAdmin. La posición de cada uno sale
    // de GET /tracking/{rentalId}/live (telemetry-gps): no hay un "listar todas las posiciones",
    // es por renta, porque un mismo gpsId se reusa entre rentas distintas.
    getTrackedVehicles: async () => {
        const [rentals, gpsDevices, reservations, vehicles] = await Promise.all([
            rentalService.getAll(),
            httpClient.get('/gps'),
            reservationService.getAllAdmin(),
            inventoryService.getAll(),
        ]);

        const gpsById = Object.fromEntries(gpsDevices.map((g) => [g.id, g]));
        const reservationsById = Object.fromEntries(reservations.map((r) => [r.id, r]));
        const vehiclesById = Object.fromEntries(vehicles.map((v) => [v.id, v]));

        const activeRentals = rentals.filter((r) => r.status === 'IN_PROGRESS' && r.gps_id);

        return Promise.all(activeRentals.map(async (rental) => {
            const reservation = reservationsById[rental.reservation_id];
            const vehicle = reservation ? vehiclesById[reservation.vehicle_id] : null;

            // Todavía no hay ningún punto para esta renta (ej. el GPS no tiene señal aún): 404,
            // no es un error real, solo "sin posición todavía".
            const lastLocation = await httpClient.get(`/tracking/${rental.id}/live`).catch(() => null);

            return {
                vehicle_id: vehicle?.id,
                plate: vehicle?.plate,
                brand: vehicle?.brand,
                model: vehicle?.model,
                rental: { id: rental.id },
                device: gpsById[rental.gps_id] ? {
                    model: gpsById[rental.gps_id].model,
                    connected: gpsById[rental.gps_id].active,
                } : null,
                position: lastLocation ? toLocationViewModel(lastLocation) : null,
            };
        }));
    },

    // Historial completo de la renta (HU-GPS-002): un punto por cada reporte del GPS.
    getTrack: async (rentalId) => {
        const points = await httpClient.get(`/tracking/${rentalId}/history`);
        return points.map(toLocationViewModel);
    },
};