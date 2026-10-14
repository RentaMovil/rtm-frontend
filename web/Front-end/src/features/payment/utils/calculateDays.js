// @ts-nocheck
export function calculateDays(startDate, endDate) {
    if (!startDate || !endDate) {
        return 0;
    }

    // Convertimos los parámetros a objetos Date reales por si vienen como Strings
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);

    // Validamos que sean fechas válidas para evitar errores de NaN
    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
        return 0;
    }

    const difference = endObj.getTime() - startObj.getTime();

    // Igual que el backend (ReservationUseCaseImpl.daysBetween, que usa
    // Duration.between(start, end).toDays()): se usa la fecha y hora completas (sin truncar
    // a medianoche) y se trunca hacia abajo (floor), nunca se redondea, con mínimo 1 día.
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    return Math.max(days, 1);
}
