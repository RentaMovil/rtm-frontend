import { CURRENCY } from "../../../types";

import type {
  ReservationDraft,
  ReservationRequest,
} from "../../../types";

/**
 * Aplana un borrador de reserva al payload normalizado que enviara el
 * backend: ids en lugar de objetos.
 *
 * El borrador guarda `vehicle` y las sucursales resueltos (estado de UI);
 * aqui se convierten a FKs, que es como los almacena la API.
 */
export function buildReservationRequest(
  draft: ReservationDraft,
): ReservationRequest {
  if (!draft.vehicle || !draft.pickupBranch || !draft.returnBranch) {
    throw new Error("La reserva esta incompleta");
  }

  return {
    vehicleId: draft.vehicle.id,
    ...(draft.insuranceTypeId
      ? { insuranceTypeId: draft.insuranceTypeId }
      : {}),
    pickupBranchId: draft.pickupBranch.id,
    returnBranchId: draft.returnBranch.id,
    pickupDate: draft.pickupDate.toISOString(),
    returnDate: draft.returnDate.toISOString(),
    termsAccepted: draft.termsAccepted,
  };
}

/** Moneda del negocio, reexportada para los calculos de la pantalla. */
export { CURRENCY };
