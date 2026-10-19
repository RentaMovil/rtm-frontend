// Fechas entre el frontend y los servicios Java (LocalDateTime, siempre en UTC).
//
// Los servicios guardan y devuelven las fechas en UTC pero SIN zona horaria
// ("2026-11-01T15:00:00"). Si el navegador lee ese texto tal cual, lo toma como
// hora local y la corre 5 horas en Colombia. Por eso:
//   - al LEER se le agrega la "Z" (UTC) antes de crear el Date;
//   - al ENVIAR se manda la hora UTC sin la "Z", que es lo que espera LocalDateTime.

const HAS_ZONE = /(Z|[+-]\d{2}:\d{2})$/i;

export function fromApiDateTime(value) {
    if (!value) return value;
    return HAS_ZONE.test(value) ? value : `${value}Z`;
}

export function toApiDateTime(value) {
    if (!value) return value;
    return new Date(value).toISOString().slice(0, 19);
}

// Formato legible para el usuario, en su zona horaria local.
// Ej: "sáb, 1 nov 2026" y "10:00 a. m."
export function formatDisplayDate(value, locale = "es-CO") {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(locale, {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
}

export function formatDisplayTime(value, locale = "es-CO") {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true });
}
