import { httpClient } from "../../../shared/api/httpClient";
import { toInsuranceViewModel } from "./insuranceMapper";
import type { InsuranceType } from "../../../types";

// GET /reservations/insurance-types (rtm-booking-reservation, publico, sin token).
// No es /insuranceTypes: el gateway solo enruta /reservations/**, /rentals/** y
// /notifications/** hacia booking-reservation (ver su README, "Rutas bajo los prefijos del gateway").
const RESOURCE = "/reservations/insurance-types";

/**
 * Acceso al catálogo de seguros.
 *
 * Antes se resolvía localmente con un mock; ahora viene de rtm-booking-reservation,
 * la misma API real que usa el frontend web.
 */

export async function getInsuranceOptions(): Promise<InsuranceType[]> {
    const response = await httpClient.get<any[]>(RESOURCE);
    return response.map(toInsuranceViewModel);
}