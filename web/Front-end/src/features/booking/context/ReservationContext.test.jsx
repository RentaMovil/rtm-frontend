import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReservationProvider, useReservation } from "./ReservationContext";

function renderReservation() {
  return renderHook(() => useReservation(), { wrapper: ReservationProvider });
}

describe("ReservationContext", () => {
  it("arranca en blanco: ningún paso del borrador tiene valor todavía", () => {
    const { result } = renderReservation();

    expect(result.current.reservation).toEqual({
      insuranceId: null,
      vehicle: null,
      pickupDate: null,
      returnDate: null,
      pickupBranch: null,
      returnBranch: null,
      termsAcceptance: null,
    });
  });

  it("updateReservation mezcla los campos nuevos sin pisar los que no vienen", () => {
    const { result } = renderReservation();
    const vehicle = { vehicleId: 7 };
    const pickupDate = new Date("2026-11-01");

    act(() => result.current.updateReservation({ vehicle, pickupDate }));

    expect(result.current.reservation.vehicle).toBe(vehicle);
    expect(result.current.reservation.pickupDate).toBe(pickupDate);
    // Lo que no vino en esta llamada sigue como estaba (null), no se perdió.
    expect(result.current.reservation.returnDate).toBeNull();

    const returnBranch = { id: 2 };
    act(() => result.current.updateReservation({ returnBranch }));

    // La actualización anterior (vehicle, pickupDate) sigue viva tras la segunda llamada.
    expect(result.current.reservation.vehicle).toBe(vehicle);
    expect(result.current.reservation.returnBranch).toBe(returnBranch);
  });

  it("updateInsurance solo cambia insuranceId", () => {
    const { result } = renderReservation();

    act(() => result.current.updateReservation({ vehicle: { vehicleId: 7 } }));
    act(() => result.current.updateInsurance("3"));

    expect(result.current.reservation.insuranceId).toBe("3");
    expect(result.current.reservation.vehicle).toEqual({ vehicleId: 7 });
  });

  it("clearReservation borra todo el borrador, incluyendo el vehículo y los términos aceptados", () => {
    const { result } = renderReservation();

    act(() =>
      result.current.updateReservation({
        vehicle: { vehicleId: 7 },
        insuranceId: "3",
        termsAcceptance: { accepted: true, version: "v1", acceptedAt: "2026-10-01" },
      }),
    );

    act(() => result.current.clearReservation());

    expect(result.current.reservation).toEqual({
      insuranceId: null,
      vehicle: null,
      pickupDate: null,
      returnDate: null,
      pickupBranch: null,
      returnBranch: null,
      termsAcceptance: null,
    });
  });

  it("useReservation fuera del provider avisa con un error claro, no con un crash silencioso", () => {
    expect(() => renderHook(() => useReservation())).toThrow(
      "useReservation debe utilizarse dentro de ReservationProvider",
    );
  });
});
