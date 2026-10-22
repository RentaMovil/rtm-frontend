import { fromApiDateTime } from "../../../../shared/utils/apiDate";

export const STATUS_ORDER = ["PENDING_REVIEW", "PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED"];

// El backend manda LocalDateTime en UTC sin zona ("2026-11-01T15:00:00"); sin la "Z",
// new Date(...) la toma como si ya fuera hora local y la corre el offset del navegador. Un
// Date ya construido (ej. "ahora mismo" del lado del cliente) se usa tal cual.
function toLocalDate(value) {
  return value instanceof Date ? value : new Date(fromApiDateTime(value));
}

export function getTotal(r) {
  return r.rentalSubtotal + r.insurance.amount;
}

// Reservation.status only has 5 values in the domain model — CONFIRMED covers both
// "not picked up yet" and "vehicle out with the customer". This derives a friendlier
// display-only status so admins can tell the two apart at a glance.
export function getDisplayStatus(r) {
  if (r.status === "CONFIRMED" && r.rental?.status === "IN_PROGRESS") return "IN_PROGRESS";
  return r.status;
}

export function statusMeta(status, t) {
  return {
    PENDING_REVIEW: { label: t("reservations.status.pendingReview"), className: "amber" },
    PENDING_PAYMENT: { label: t("reservations.status.pendingPayment"), className: "yellow" },
    CONFIRMED: { label: t("reservations.status.confirmed"), className: "emerald" },
    IN_PROGRESS: { label: t("reservations.status.inProgress"), className: "purple" },
    COMPLETED: { label: t("reservations.status.completed"), className: "blue" },
    CANCELLED: { label: t("reservations.status.cancelled"), className: "slate" },
  }[status];
}

export function formatDate(iso, lang) {
  return toLocalDate(iso).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(iso, lang) {
  return toLocalDate(iso).toLocaleTimeString(lang, { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatMoney(n) {
  return `$ ${n.toLocaleString("es-CO")} COP`;
}
