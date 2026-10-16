import { useReservation } from "../../booking/context/ReservationContext";
import { useInsurance } from "../../admin/insuranceTypes/hooks/useInsurance";
import { calculateRentalDays } from "../../../shared/utils/rental";
import { calculateInvoiceTotal } from "../utils/calculateIvoiceTotal";
import "./InvoiceCard.css";

/**
 * Contenido del resumen de factura. El "chrome" de la tarjeta
 * (borde, fondo, encabezado con título) lo aporta la sección
 * .pay-card de Payment.jsx — este componente solo entrega su
 * contenido interno, igual que BankAccountSelector, TransferDetails
 * y PaymentReceiptUpload.
 */
export default function InvoiceCard({
  days: propDays,
  vehicle: propVehicle,
}) {
  const { reservation } = useReservation();
  const { insurance } = useInsurance();

  const vehicle = propVehicle || reservation?.vehicle;

  const days =
    propDays ||
    calculateRentalDays(
      reservation?.pickupDate,
      reservation?.returnDate
    );

  const selectedInsurance = insurance.find(
    (item) => item.id === reservation?.insuranceId
  );

  if (!vehicle) {
    return null;
  }

  const {
    vehicleSubtotal,
    insuranceSubtotal,
    totalAmount,
  } = calculateInvoiceTotal(
    days,
    vehicle,
    selectedInsurance
  );

  return (
    <div className="pay-invoice-body">
      {/* Desglose: Alquiler */}
      <div className="pay-resumen-row">
        <span className="pay-resumen-label">
          Alquiler ({days} Día{days !== 1 ? "s" : ""} × $
          {Number(vehicle.price).toLocaleString("es-CO")} COP)
        </span>
        <span className="pay-resumen-value">
          ${vehicleSubtotal.toLocaleString("es-CO")} COP
        </span>
      </div>

      {/* Desglose: Seguro */}
      <div className="pay-resumen-row">
        <div className="pay-insurance-label-group">
          <span className="pay-resumen-label">Seguro Todo Riesgo</span>
          <span className="pay-badge-selected">Seleccionado</span>
        </div>
        <span className="pay-resumen-value">
          ${insuranceSubtotal.toLocaleString("es-CO")} COP
        </span>
      </div>

      {/* Separador punteado */}
      <div className="pay-divider" />

      {/* Total y Status Badge */}
      <div className="pay-total-row">
        <div className="pay-total-info">
          <span className="pay-total-label">TOTAL A TRANSFERIR</span>
          <div className="pay-total-amount">
            ${totalAmount.toLocaleString("es-CO")}{" "}
            <span className="pay-currency">COP</span>
          </div>
        </div>

        <div className="pay-status-badge">
          <span className="pay-status-dot" />
          Monto exacto requerido
        </div>
      </div>

      {/* Callout de Advertencia / Aviso */}
      <div className="pay-warning-box">
        <span className="pay-warning-icon">⚠️</span>
        <p className="pay-warning-text">
          <strong>Aviso importante (INV-001):</strong> El monto transferido
          debe coincidir exactamente con el total (
          <u>${totalAmount.toLocaleString("es-CO")} COP</u>). No se aceptan
          transferencias fraccionadas ni pagos parciales.
        </p>
      </div>
    </div>
  );
}
