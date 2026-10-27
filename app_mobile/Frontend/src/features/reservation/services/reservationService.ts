import { httpClient, isAbortError, type HttpRequestOptions } from "../../../shared/api/httpClient";
import type { Reservation, ReservationRequest, ReservationResponse } from "../../../types";
import { toCreateReservationPayload, toReservationResponse, toReservationViewModel } from "./reservationMapper";

const RESOURCE = "/reservations";

/**
 * Servicio de reservas contra rtm-booking-reservation (a traves del gateway).
 *
 * El `clientId` ya no se usa para armar el payload ni para filtrar: el
 * backend siempre toma el titular del token (JWT), nunca de un parametro ni
 * del cuerpo (ver README del servicio, "El clientId sale del token"). Se
 * deja el parametro en las funciones para no tocar cada pantalla que ya
 * las llama con el id del usuario logueado.
 */
export async function createReservation(
    data: ReservationRequest,
    _clientId: string,
): Promise<ReservationResponse> {
    const payload = toCreateReservationPayload(data);
    const raw = await httpClient.post<any>(RESOURCE, payload);
    return toReservationResponse(raw);
}

/** GET /reservations/mine: ya viene filtrado al usuario del token, no hay que filtrar aqui. */
export async function getMyReservations(
    _clientId: string,
    options?: HttpRequestOptions,
): Promise<Reservation[]> {
    const all = await httpClient.get<any[]>(`${RESOURCE}/mine`, options);
    return all.map(toReservationViewModel);
}

export async function getReservationById(
    id: string,
    options?: HttpRequestOptions,
): Promise<Reservation | undefined> {
    try {
        const raw = await httpClient.get<any>(`${RESOURCE}/${id}`, options);
        return toReservationViewModel(raw);
    } catch (error) {
        if (isAbortError(error)) throw error;
        return undefined;
    }
}

/**
 * POST /reservations/{id}/cancel (no PATCH con status: la cancelacion tiene
 * su propia ruta; PATCH /reservations/{id} solo acepta newReturnBranchId).
 */
export async function cancelReservation(id: string): Promise<Reservation | undefined> {
    const raw = await httpClient.post<any>(`${RESOURCE}/${id}/cancel`);
    return toReservationViewModel(raw);
}

/**
 * PATCH /reservations/{id}: unico campo modificable de una reserva ya creada
 * (HU-BOOKING-005). El backend valida el estado (no CANCELLED/COMPLETED) y el
 * plazo (INV-013: hasta 3 dias antes de end_date); si no se cumple responde
 * 409/400 con un mensaje de negocio que `httpClient` propaga en `error.message`.
 */
export async function updateReturnBranch(
    id: string,
    newReturnBranchId: string,
): Promise<Reservation> {
    const numericId = Number(newReturnBranchId);
    const raw = await httpClient.patch<any>(`${RESOURCE}/${id}`, {
        newReturnBranchId: Number.isFinite(numericId) ? numericId : newReturnBranchId,
    });
    return toReservationViewModel(raw);
}
