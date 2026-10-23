/**
 * Formatea un datetime de reserva (`start_date` / `end_date`) para mostrarlo.
 *
 * El backend (rtm-booking-reservation) los expone como `LocalDateTime`
 * (ver `ReservationResponse.java`): un string ISO SIN sufijo de zona
 * ("2026-10-25T10:00:00"), que son la hora de recogida/devolucion tal cual
 * se guardo, no un instante UTC.
 *
 * `new Date(iso)` + `toLocaleString()` deja que el motor reinterprete esos
 * componentes en la zona horaria del DISPOSITIVO (o en UTC, segun el motor,
 * ya que el string no trae offset), lo que puede correr el dia mostrado.
 * Para evitarlo, se extraen los componentes del string directamente (sin
 * pasar por ninguna conversion de zona horaria) y se formatean fijando
 * `timeZone: "UTC"` en `Intl.DateTimeFormat`, de modo que lo que se ve es
 * exactamente lo que mando el backend.
 */
const ISO_DATETIME = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

/** Fecha y hora legibles, ej. "25 oct. 2026, 10:00 a. m.". */
export function formatReservationDateTime(value: string | null | undefined): string {
    if (!value) return "-";

    const match = ISO_DATETIME.exec(value);
    if (!match) return value;

    const [, year, month, day, hour = "00", minute = "00"] = match;
    const asUtc = new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)),
    );

    return new Intl.DateTimeFormat("es-CO", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(asUtc);
}

/**
 * Convierte un `start_date`/`end_date` de la API (string sin offset, hora
 * "de pared") a un `Date`, anclado a UTC para que la resta de fechas no
 * dependa de la zona horaria del dispositivo. No es un instante real: solo
 * sirve para comparar contra `wallClockNow()`, construido con el mismo
 * ancla, al validar ventanas de tiempo (ej. INV-004, INV-013).
 */
export function parseReservationDateTime(value: string | null | undefined): Date | null {
    if (!value) return null;

    const match = ISO_DATETIME.exec(value);
    if (!match) return null;

    const [, year, month, day, hour = "00", minute = "00"] = match;
    return new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)),
    );
}

/** "Ahora", expresado como hora de pared en el mismo ancla que `parseReservationDateTime`. */
export function wallClockNow(): Date {
    const now = new Date();
    return new Date(
        Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
        ),
    );
}

/** Solo la fecha, sin hora, ej. "25 oct. 2026". */
export function formatReservationDate(value: string | null | undefined): string {
    if (!value) return "-";

    const match = ISO_DATETIME.exec(value);
    if (!match) return value;

    const [, year, month, day] = match;
    const asUtc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

    return new Intl.DateTimeFormat("es-CO", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(asUtc);
}
