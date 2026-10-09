/**
 * Fecha simple (yyyy-MM-dd) en hora local, para endpoints que piden
 * LocalDate (ej. GET /vehicles/{id}/availability). `Date.toISOString()` no
 * sirve aqui: convierte a UTC primero, y en Colombia (UTC-5) eso puede
 * correr la fecha un dia hacia atras.
 */
export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
