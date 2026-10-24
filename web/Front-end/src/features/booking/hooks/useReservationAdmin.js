import { useCallback, useEffect, useState } from "react";
import { reservationService } from "../services/reservationService";
import { rentalService } from "../services/rentalService";
import { toAdminReservationViewModel } from "../services/reservationMapper";
import { carsService } from "../../vehicles/Services/carsService";
import { branchService } from "../../admin/branches/services/branchService";
import { insuranceService } from "../../admin/insuranceTypes/services/insuranceService";
//import { userService } from "../../admin/userManagement/services/userService";

import { httpClient } from "../../../shared/api/httpClient";

// Lista de una petición opcional: si el servicio todavía no existe o falla, queda vacía
const listOrEmpty = (result) =>
    result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [];

export function useReservationsAdmin() {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Lo de booking es obligatorio: sin reservas no hay pantalla.
            const [reservationsRes, rentalsRes] = await Promise.all([
                reservationService.getAllAdmin(),
                rentalService.getAll(),
            ]);

            // Lo de los demás servicios solo completa la información (nombres, pagos, GPS).
            // Con allSettled, si uno de ellos todavía no existe la pantalla carga igual.
            const optional = await Promise.allSettled([
                carsService.getAllForAdmin(),
                branchService.getAll(),
                insuranceService.getAll(),
                httpClient.get('/payments'),
                httpClient.get('/bank-accounts'),
                httpClient.get('/gps'),
                httpClient.get('/users'),
            ]);
            const [vehiclesRes, branchesRes, insuranceRes, paymentsRes, bankAccountsRes, gpsRes, usersRes] =
                optional.map(listOrEmpty);

            const ctx = {
                vehiclesById: Object.fromEntries(vehiclesRes.map((v) => [v.id, v])),
                branchesById: Object.fromEntries(branchesRes.map((b) => [b.id, b])),
                insuranceById: Object.fromEntries(insuranceRes.map((i) => [i.id, i])),
                // payment-billing devuelve del más nuevo al más viejo: con varios intentos por
                // reserva (uno REJECTED y luego uno PENDING_REVIEW), el primero que aparece para
                // cada reservationId es el vigente — por eso no se sobreescribe si ya hay uno.
                paymentsByReservation: paymentsRes.reduce((acc, p) => {
                    if (!acc[p.reservationId]) acc[p.reservationId] = p;
                    return acc;
                }, {}),
                rentalsByReservation: Object.fromEntries(rentalsRes.map((r) => [r.reservation_id, r])),
                bankAccountsById: Object.fromEntries(bankAccountsRes.map((b) => [b.id, b])),
                gpsById: Object.fromEntries(gpsRes.map((g) => [g.id, g])),
                // reservation.client_id es iam.person.person_id, no user_id: hay que indexar por
                // personId para que el cruce con la reserva funcione (iam-progress, personId en UserSummary).
                usersById: Object.fromEntries(usersRes.map((u) => [u.personId, u])),
            };

            setReservations(reservationsRes.map((r) => toAdminReservationViewModel(r, ctx)));
        } catch (err) {
            setError(err.message || "No se pudieron cargar las reservas.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    return { reservations, isLoading, error, refetch: fetchAll };
}