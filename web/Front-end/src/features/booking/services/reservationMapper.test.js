import { describe, expect, it, vi } from "vitest";

// reservationMapper importa el i18n real para los mensajes de error; en un test
// unitario de node (sin DOM) ese módulo no tiene localStorage/navigator.
// Las funciones que probamos aquí no dependen del idioma, así que basta un stub.
vi.mock("../../../Traductions/index.js", () => ({
  default: { t: (key) => key },
}));

const { fromApiReservation, canCancelReservation, toCreateReservationPayload } = await import(
  "./reservationMapper"
);
const { RENTAL_TERMS_VERSION } = await import("../data/rentalTerms");

describe("fromApiReservation", () => {
  it("convierte la respuesta camelCase de booking a snake_case y castea los montos", () => {
    const viewModel = fromApiReservation({
      id: 10,
      vehicleId: 5,
      insuranceTypeId: 2,
      pickupBranchId: 1,
      returnBranchId: 1,
      reservationDate: "2026-10-01T10:00:00",
      startDate: "2026-10-05T10:00:00",
      endDate: "2026-10-07T10:00:00",
      vehicleSubtotal: "100000",
      insuranceSubtotal: "20000",
      totalAmount: "120000",
      status: "CONFIRMED",
    });

    expect(viewModel.vehicle_id).toBe(5);
    expect(viewModel.total_amount).toBe(120000);
    expect(viewModel.client_id).toBeNull();
    expect(viewModel.status).toBe("CONFIRMED");
  });
});

describe("canCancelReservation", () => {
  it("siempre devuelve false: ADR-015 quitó la cancelación por el cliente", () => {
    const futureReservation = {
      status: "CONFIRMED",
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    expect(canCancelReservation(futureReservation)).toBe(false);
  });
});

describe("toCreateReservationPayload", () => {
  const validTermsAcceptance = {
    accepted: true,
    version: RENTAL_TERMS_VERSION,
    acceptedAt: new Date().toISOString(),
  };

  const baseReservation = {
    vehicle: { vehicleId: 7 },
    pickupBranch: { id: 1 },
    returnBranch: { id: 2 },
    pickupDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    insuranceId: 3,
    termsAcceptance: validTermsAcceptance,
  };

  it("arma el payload solo con lo que elige el cliente, sin montos ni estado", () => {
    const payload = toCreateReservationPayload(baseReservation);

    expect(payload).toMatchObject({
      vehicleId: 7,
      insuranceTypeId: 3,
      pickupBranchId: 1,
      returnBranchId: 2,
      termsAccepted: true,
    });
    expect(payload).not.toHaveProperty("totalAmount");
    expect(payload).not.toHaveProperty("status");
  });

  it("lanza error si falta algún dato obligatorio", () => {
    expect(() => toCreateReservationPayload({ ...baseReservation, pickupBranch: null })).toThrow();
  });

  it("lanza error si no se aceptaron los términos vigentes", () => {
    expect(() =>
      toCreateReservationPayload({
        ...baseReservation,
        termsAcceptance: { ...validTermsAcceptance, version: "2000-01-01" },
      }),
    ).toThrow();
  });

  it("lanza error si la fecha de recogida ya pasó", () => {
    expect(() =>
      toCreateReservationPayload({
        ...baseReservation,
        pickupDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      }),
    ).toThrow();
  });
});
