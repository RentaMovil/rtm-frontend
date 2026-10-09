import type {
    Reservation,
    ReservationRequest,
    ReservationResponse,
} from "../../../types";
import { RESERVATION_STATUS } from "../../../types";

function toApiId(id: string): string | number {
    const numericId = Number(id);
    return Number.isFinite(numericId) ? numericId : id;
}

/**
 * Payload de CreateReservationRequest (rtm-booking-reservation).
 *
 * El backend calcula el precio y las fechas: NO se le mandan dias,
 * subtotales ni total (eso lo hace el servidor contra el precio real del
 * vehiculo, via fleet-maintenance). Tampoco lleva clientId: el titular sale
 * del token (ver CreateReservationRequest.java). Por eso, a diferencia del
 * payload del mock, este es solo lo que el formulario pide: ids y fechas.
 */
export function toCreateReservationPayload(request: ReservationRequest) {
    return {
        vehicleId: toApiId(request.vehicleId),
        insuranceTypeId: request.insuranceTypeId ? toApiId(request.insuranceTypeId) : null,
        pickupBranchId: toApiId(request.pickupBranchId),
        returnBranchId: toApiId(request.returnBranchId),
        startDate: request.pickupDate,
        endDate: request.returnDate,
        termsAccepted: request.termsAccepted,
    };
}

export function toReservationResponse(raw: any): ReservationResponse {
    return {
        reservationId: String(raw.id),
        status: raw.status,
    };
}

/**
 * ReservationResponse (rtm-booking-reservation): camelCase, sin clientId
 * (nunca se expone; el titular siempre es el usuario autenticado).
 */
export function toReservationViewModel(raw: any): Reservation {
    const startDate = raw.startDate;
    const endDate = raw.endDate;
    const days = Math.max(
        1,
        Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
    );
    const vehicleSubtotal = Number(raw.vehicleSubtotal) || 0;
    const insuranceSubtotal = Number(raw.insuranceSubtotal) || 0;

    return {
        id: String(raw.id),
        created_at: raw.reservationDate ?? "",
        status: raw.status ?? RESERVATION_STATUS.PENDING_PAYMENT,
        currency: "COP",
        // El backend no expone clientId (siempre es el usuario autenticado); se
        // completa en el servicio, que sí conoce quién hizo la petición.
        clientId: raw.clientId !== undefined ? String(raw.clientId) : "",
        vehicleId: String(raw.vehicleId),
        ...(raw.insuranceTypeId ? { insuranceTypeId: String(raw.insuranceTypeId) } : {}),
        pickupBranchId: String(raw.pickupBranchId),
        returnBranchId: String(raw.returnBranchId),
        start_date: startDate,
        end_date: endDate,
        days,
        price_per_day: vehicleSubtotal / days,
        subtotal_vehicle: vehicleSubtotal,
        insurance_per_day: insuranceSubtotal / days,
        subtotal_insurance: insuranceSubtotal,
        total_price: Number(raw.totalAmount) || vehicleSubtotal + insuranceSubtotal,
        insurance_included: Boolean(raw.insuranceTypeId),
    } as Reservation;
}
