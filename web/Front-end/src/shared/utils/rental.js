export const calculateRentalDays = (pickupDate, returnDate) => {
  if (!pickupDate || !returnDate) return 0;

  const start = new Date(pickupDate);
  const end = new Date(returnDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  const difference = end - start;

  // Igual que el backend (ReservationUseCaseImpl.daysBetween): se trunca a días completos
  // (floor), nunca se redondea hacia arriba, con un mínimo de 1 día.
  return Math.max(
    1,
    Math.floor(difference / (1000 * 60 * 60 * 24))
  );
};

export const calculateTotal = (pickupDate, returnDate, pricePerDay) => {
  const days = calculateRentalDays(pickupDate, returnDate);

  return days * Number(pricePerDay || 0);
};
