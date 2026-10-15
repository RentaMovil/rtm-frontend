import type { InsuranceType } from "../../../types";

/**
 * Forma real de rtm-booking-reservation (InsurancePlanResponse):
 * { id, name, coverageDetails, dailyCost, totalCost }, en camelCase (Java),
 * no snake_case (eso era del mock). No tiene `tag`: ese agrupador
 * (base/popular/premium) es solo de la UI, asi que se usa "base" por
 * defecto hasta que el backend lo exponga, si alguna vez hace falta.
 */
export function toInsuranceViewModel(insurance: any): InsuranceType {
    return {
        id: String(insurance.id),
        name: insurance.name,
        description: insurance.coverageDetails,
        price: Number(insurance.dailyCost) || 0,
        tag: insurance.tag ?? "base",
    };
}