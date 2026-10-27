/**
 * Versión publicada de los términos de reserva.
 *
 * IMPORTANTE: este contenido es una base comercial editable. La razón social,
 * NIT, domicilio, canales de atención y política definitiva de cancelación,
 * reembolso y depósito deben ser completados y validados por un abogado antes
 * de publicar el sistema en producción. Al modificar el texto, incremente la
 * versión para que las aceptaciones anteriores sigan siendo auditables.
 */
export const RENTAL_TERMS_VERSION = "2026-10-27";

// IDs de las secciones, en orden. El título y los párrafos de cada una viven en las
// traducciones (namespace "rentalTerms") para que el documento se muestre en el idioma
// activo; getRentalTermsSections(t) construye la lista ya traducida.
const RENTAL_TERMS_SECTION_IDS = [
    "objeto",
    "requisitos",
    "reserva",
    "pago",
    "cambios",
    "entrega",
    "deposito",
    "uso",
    "responsabilidad",
    "devolucion",
    "disponibilidad",
    "datos",
    "derechos",
    "vigencia",
];

/**
 * Construye las secciones de los términos ya traducidas al idioma activo.
 * @param {(key: string, options?: object) => any} t - función t de react-i18next
 */
export function getRentalTermsSections(t) {
    return RENTAL_TERMS_SECTION_IDS.map((id) => ({
        id,
        title: t(`rentalTerms.sections.${id}.title`),
        paragraphs: t(`rentalTerms.sections.${id}.paragraphs`, { returnObjects: true }),
    }));
}

/** Fecha de vigencia de los términos, traducida al idioma activo. */
export function getRentalTermsEffectiveDate(t) {
    return t("rentalTerms.effectiveDate");
}

/**
 * Crea el registro que acompaña la reserva.
 * @returns {{accepted: true, version: string, acceptedAt: string}}
 */
export function createTermsAcceptance() {
    return {
        accepted: true,
        version: RENTAL_TERMS_VERSION,
        acceptedAt: new Date().toISOString(),
    };
}

/**
 * Valida únicamente la forma del registro. En producción, el backend debe
 * volver a validar la versión vigente y asociar la aceptación a la reserva.
 * El servidor debe conservar además su propia fecha de recepción.
 */
export function isValidTermsAcceptance(acceptance) {
    if (
        acceptance?.accepted !== true ||
        acceptance.version !== RENTAL_TERMS_VERSION ||
        typeof acceptance.acceptedAt !== "string"
    ) {
        return false;
    }

    return Number.isFinite(Date.parse(acceptance.acceptedAt));
}
