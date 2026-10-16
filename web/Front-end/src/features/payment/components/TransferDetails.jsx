import { useReservation } from "../../booking/context/ReservationContext";
import { useInsurance } from "../../admin/insuranceTypes/hooks/useInsurance";
import { calculateRentalDays } from "../../../shared/utils/rental";
import { calculateInvoiceTotal } from "../utils/calculateIvoiceTotal";
import { usePayment } from "../context/PaymentContext";
import "./TransferDetails.css";

/**
 * Contenido del formulario de transferencia. El encabezado de la
 * sección lo aporta Payment.jsx (PaySectionHeader), igual que en
 * el resto de tarjetas de la página de pago.
 */
export default function TransferDetails() {
    const { reservation } = useReservation();
    const { payment, updatePayment } = usePayment();
    const { insurance } = useInsurance();

    const vehicle = reservation?.vehicle;

    const days = calculateRentalDays(
        reservation?.pickupDate,
        reservation?.returnDate
    );

    const selectedInsurance = insurance.find(
        (item) => item.id === reservation?.insuranceId
    );

    if (!vehicle) {
        return null;
    }

    const { totalAmount } = calculateInvoiceTotal(
        days,
        vehicle,
        selectedInsurance
    );

    function handleReferenceChange(event) {
        updatePayment({
            referenceNumber: event.target.value,
        });
    }

    return (
        <div className="transfer-details-body">
            <div className="transfer-details-amount">
                <span className="transfer-details-amount-label">
                    TOTAL A TRANSFERIR
                </span>

                <strong>
                    ${totalAmount.toLocaleString("es-CO")} COP
                </strong>
            </div>

            <div className="transfer-details-warning">
                <span>⚠️</span>

                <p>
                    El monto transferido debe coincidir exactamente con
                    el total de la reserva. No se aceptan pagos parciales.
                </p>
            </div>

            <div className="transfer-details-field">
                <label htmlFor="referenceNumber">
                    Número de referencia
                </label>

                <input
                    id="referenceNumber"
                    name="referenceNumber"
                    type="text"
                    value={payment?.referenceNumber || ""}
                    onChange={handleReferenceChange}
                    placeholder="Ingresa el número de referencia"
                    autoComplete="off"
                />

                <small>
                    Puedes encontrar este número en el comprobante de
                    la transferencia.
                </small>
            </div>
        </div>
    );
}
