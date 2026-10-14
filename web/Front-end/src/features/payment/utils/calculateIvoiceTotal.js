
export function calculateInvoiceTotal(
    days,
    vehicle,
    selectedInsurance
) {
    const vehicleSubtotal =
        days * Number(vehicle?.price ?? 0);

    // Igual que el backend (InsuranceType.costFor): el seguro es un costo diario
    // (selectedInsurance.price = daily_cost) y se cobra una vez por TODA la duración
    // de la reserva, es decir dailyCost * days -- no un monto plano.
    const insuranceSubtotal =
        days * Number(selectedInsurance?.price ?? 0);

    const totalAmount =
        vehicleSubtotal + insuranceSubtotal;

    return {
        vehicleSubtotal,
        insuranceSubtotal,
        totalAmount,
    };
}
