import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";

import type {
  Branch,
  ReservationDraft,
  ReservationResponse,
  Vehicle,
} from "../../../types";

type ReservationContextType = {
  reservation: ReservationDraft | null;
  /**
   * Reserva ya creada, con su id y estado.
   *
   * Se guarda aparte del borrador porque el pago necesita referenciar el
   * `reservationId` que devuelve el backend, no el borrador de UI. En el
   * dominio la reserva nace en PENDING_PAYMENT y el pago es otro agregado.
   */
  createdReservation: ReservationResponse | null;
  createReservation: (
    vehicle: Vehicle,
    pickupBranch: Branch,
    returnBranch: Branch,
    pickupDate: Date,
    returnDate: Date,
  ) => void;
  setCreatedReservation: (created: ReservationResponse | null) => void;
  updatePickupBranch: (branch: Branch) => void;
  updateReturnBranch: (branch: Branch) => void;
  updateInsurance: (insuranceTypeId: string | null) => void;
  updateTermsAccepted: (accepted: boolean) => void;
  clearReservation: () => void;
};

const ReservationContext = createContext<ReservationContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function ReservationProvider({ children }: Props) {
  const { user } = useAuth();
  const [reservation, setReservation] = useState<ReservationDraft | null>(null);
  const [createdReservation, setCreatedReservation] =
    useState<ReservationResponse | null>(null);

  const createReservation = useCallback(
    (
      vehicle: Vehicle,
      pickupBranch: Branch,
      returnBranch: Branch,
      pickupDate: Date,
      returnDate: Date,
    ) => {
      setReservation({
        vehicle,
        pickupBranch,
        returnBranch,
        pickupDate,
        returnDate,
        termsAccepted: false,
      });
    },
    [],
  );

  const updatePickupBranch = useCallback((branch: Branch) => {
    setReservation((prev) => (prev ? { ...prev, pickupBranch: branch } : prev));
  }, []);

  const updateReturnBranch = useCallback((branch: Branch) => {
    setReservation((prev) => (prev ? { ...prev, returnBranch: branch } : prev));
  }, []);

  const updateInsurance = useCallback((insuranceTypeId: string | null) => {
    setReservation((prev) => {
      if (!prev) {
        return prev;
      }

      if (insuranceTypeId) {
        return { ...prev, insuranceTypeId };
      }

      const { insuranceTypeId: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const updateTermsAccepted = useCallback((accepted: boolean) => {
    setReservation((prev) => (prev ? { ...prev, termsAccepted: accepted } : prev));
  }, []);

  const clearReservation = useCallback(() => {
    setReservation(null);
    setCreatedReservation(null);
  }, []);

  return (
    <ReservationContext.Provider
      value={{
        reservation,
        createdReservation,
        createReservation,
        setCreatedReservation,
        updatePickupBranch,
        updateReturnBranch,
        updateInsurance,
        updateTermsAccepted,
        clearReservation,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation(): ReservationContextType {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error(
      "useReservation debe utilizarse dentro de ReservationProvider",
    );
  }

  return context;
}
