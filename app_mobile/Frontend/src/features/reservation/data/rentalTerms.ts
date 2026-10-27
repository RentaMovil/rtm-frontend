import type { TFunction } from "i18next";

/**
 * Version publicada de los terminos de reserva.
 *
 * Puerto 1:1 de `web/Front-end/src/features/booking/data/rentalTerms.js`:
 * mismo numero de version y mismos ids de sección, para que el documento
 * legal que ve un cliente en el movil sea el mismo que ve en el web. El
 * texto en si (titulos y parrafos) vive en las traducciones, bajo
 * `reservation.terms.sections`, igual que en el web vive bajo el namespace
 * `rentalTerms`.
 *
 * IMPORTANTE: igual que en el web, este contenido es una base comercial
 * editable y debe mantenerse sincronizado con `rentalTerms.js`. Si el web
 * publica una nueva version, esta constante y las traducciones de
 * `reservation.terms` deben actualizarse juntas.
 */
export const RENTAL_TERMS_VERSION = "2026-10-27";

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
] as const;

export type RentalTermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

/** Construye las secciones de los terminos ya traducidas al idioma activo. */
export function getRentalTermsSections(t: TFunction): RentalTermsSection[] {
  return RENTAL_TERMS_SECTION_IDS.map((id) => ({
    id,
    title: t(`reservation.terms.sections.${id}.title`),
    paragraphs: t(`reservation.terms.sections.${id}.paragraphs`, {
      returnObjects: true,
    }) as string[],
  }));
}

/** Fecha de vigencia de los terminos, traducida al idioma activo. */
export function getRentalTermsEffectiveDate(t: TFunction): string {
  return t("reservation.terms.documentEffectiveDate");
}
