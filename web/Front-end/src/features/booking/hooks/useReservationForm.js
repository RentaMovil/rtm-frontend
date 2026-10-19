import { useEffect, useState } from "react";
import { calculateRentalDays, calculateTotal } from "../../../shared/utils/rental";
import { hasInvalidDateRange, isAdult } from "../../../shared/utils/validation";
import { useDialog } from "../../../shared/components/dialog/dialogContext";

export const useReservationForm = (price, navigate, t, initialBranch = null, initialSearch = {}) => {
  const { alert } = useDialog();
  const [opcion, setOpcion] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(initialBranch ?? null);
  const [pickupBranch, setPickupBranch] = useState(initialSearch.branch ?? initialBranch ?? null);
  const [nameR, setNameR] = useState("");
  const [document, setDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pickupDate, setPickupDate] = useState(initialSearch.startDate ?? "");
  const [returnDate, setReturnDate] = useState(initialSearch.endDate ?? "");
  const [pickupTime, setPickupTime] = useState(initialSearch.startTime ?? "");
  const [returnTime, setReturnTime] = useState(initialSearch.endTime ?? "");
  const [errorFecha, setErrorFecha] = useState("");
  const [errorEdad, setErrorEdad] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fecha + hora elegidas por el cliente (hora local) -> "YYYY-MM-DDTHH:mm"
  const combine = (d, t) => (d ? (t ? `${d}T${t}` : d) : "");
  const pickupDateTime = combine(pickupDate, pickupTime);
  const returnDateTime = combine(returnDate, returnTime);

  const days = calculateRentalDays(pickupDateTime, returnDateTime);
  const total = calculateTotal(pickupDateTime, returnDateTime, price);

  useEffect(() => {
    const invalid = hasInvalidDateRange(pickupDate, returnDate);
    setErrorFecha(invalid ? t("reservation.ErrorDate") : "");
  }, [pickupDate, returnDate, t]);

  useEffect(() => {
    if (!birthDate) {
      setErrorEdad("");
      return;
    }

    setErrorEdad(isAdult(birthDate) ? "" : t("reservation.ErrorAge"));
  }, [birthDate, t]);

  const toggleShowFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handlePayment = () => {
    if (!pickupDate || !returnDate) {
      alert({ message: t("reservation.selectDates"), tone: "warning" });
      return;
    }

    if (errorFecha) {
      alert({ message: errorFecha, tone: "warning" });
      return;
    }

    if (errorEdad) {
      alert({ message: errorEdad, tone: "warning" });
      return;
    }

    navigate("/Payment");
  };

  return {
    opcion,
    setOpcion,
    selectedBranch,
    setSelectedBranch,
    pickupBranch,
    setPickupBranch,
    nameR,
    setNameR,
    document,
    setDocument,
    birthDate,
    setBirthDate,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    pickupTime,
    returnTime,
    pickupDateTime,
    returnDateTime,
    errorFecha,
    errorEdad,
    days,
    total,
    showFilters,
    toggleShowFilters,
    handlePayment,
  };
};
