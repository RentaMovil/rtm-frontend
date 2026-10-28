import { isValidTermsAcceptance } from "../data/rentalTerms";
import { fromApiDateTime, toApiDateTime } from "../../../shared/utils/apiDate";
import i18n from "../../../Traductions/index.js";

// Estados de booking -> estados que ya usa la interfaz del cliente (estilos estado-*).
// Las tres primeras son reservas vigentes: se pueden cancelar o modificar dentro de su plazo.
const UI_STATUS = {
    PENDING_PAYMENT: 'activa',
    PENDING_REVIEW: 'activa',
    CONFIRMED: 'activa',
    CANCELLED: 'cancelada',
    COMPLETED: 'completada',
};

// INV-004: se cancela sin recargo hasta 3 días antes de la fecha de RECOGIDA
const CANCELLATION_DEADLINE_DAYS = 3;
const DAY_MS = 1000 * 60 * 60 * 24;

// Respuesta de booking (camelCase) -> forma que usan los view models (snake_case).
export function fromApiReservation(reservation) {
    return {
        id: reservation.id,
        vehicle_id: reservation.vehicleId,
        insurance_type_id: reservation.insuranceTypeId,
        pickup_branch_id: reservation.pickupBranchId,
        return_branch_id: reservation.returnBranchId,
        reservation_date: fromApiDateTime(reservation.reservationDate),
        start_date: fromApiDateTime(reservation.startDate),
        end_date: fromApiDateTime(reservation.endDate),
        vehicle_subtotal: Number(reservation.vehicleSubtotal) || 0,
        insurance_subtotal: Number(reservation.insuranceSubtotal) || 0,
        total_amount: Number(reservation.totalAmount) || 0,
        status: reservation.status,
        // Solo las reservas ADMIN lo traen; el cliente normal no necesita saber quién hizo la reserva ajena.
        client_id: reservation.clientId ?? null,
    };
}

// ADR-015: el cliente no puede cancelar una reserva. El backend ya no expone
// POST /reservations/{id}/cancel; este codigo de UI queda inactivo y puede eliminarse.
const CUSTOMER_CANCELLATION_ENABLED = false;

export function canCancelReservation(reservation, now = Date.now()) {
    if (!CUSTOMER_CANCELLATION_ENABLED) return false;
    if (UI_STATUS[reservation.status] !== 'activa') return false;
    const startDate = new Date(reservation.start_date).getTime();
    return startDate - now > CANCELLATION_DEADLINE_DAYS * DAY_MS;
}

// Solo lo que el cliente elige. Los subtotales, el total, el estado y la fecha de la
// reserva los calcula booking; el titular sale del token, nunca del cuerpo.
export function toCreateReservationPayload(reservation) {
    if (
        !reservation?.vehicle?.vehicleId ||
        !reservation?.pickupBranch?.id ||
        !reservation?.returnBranch?.id ||
        !reservation?.pickupDate ||
        !reservation?.returnDate ||
        !isValidTermsAcceptance(reservation?.termsAcceptance)
    ) {
        throw new Error(i18n.t("reservation.incomplete"));
    }

    if (new Date(reservation.pickupDate).getTime() <= Date.now()) {
        throw new Error(i18n.t("reservation.pickupTimePassed"));
    }

    return {
        vehicleId: Number(reservation.vehicle.vehicleId),
        insuranceTypeId: reservation.insuranceId == null ? null : Number(reservation.insuranceId),
        pickupBranchId: Number(reservation.pickupBranch.id),
        returnBranchId: Number(reservation.returnBranch.id),
        startDate: toApiDateTime(reservation.pickupDate),
        endDate: toApiDateTime(reservation.returnDate),
        // isValidTermsAcceptance ya se verificó arriba
        termsAccepted: true,
    };
}

// PATCH /reservations/{id}: solo la sucursal de devolución. Booking rechaza newEndDate:
// la fecha de devolución no se puede modificar.
export function toModifyReservationPayload(returnBranchId) {
    return { newReturnBranchId: Number(returnBranchId) };
}

export function toReservationViewModel(reservation, { vehiclesById = {}, branchesById = {}, insuranceById = {} } = {}) {
    const vehicle = vehiclesById[reservation.vehicle_id] || {};
    const days = Math.max(
        1,
        Math.round((new Date(reservation.end_date) - new Date(reservation.start_date)) / (1000 * 60 * 60 * 24))
    );
    const insurancePlan = insuranceById[reservation.insurance_type_id];

    return {
        id: reservation.id,
        status: UI_STATUS[reservation.status] ?? (reservation.status || '').toLowerCase(),
        // Estado real de booking (PENDING_PAYMENT, CONFIRMED...) por si la pantalla lo necesita
        backendStatus: reservation.status,
        canCancel: canCancelReservation(reservation),
        created_at: reservation.reservation_date,
        pickupBranchId: reservation.pickup_branch_id,
        returnBranchId: reservation.return_branch_id,
        vehicle: {
            img: vehicle.image,
            brand: vehicle.brand,
            model: vehicle.model,
            plate: vehicle.plate,
            category: vehicle.vehicleType,
            seats: vehicle.capacity,
        },
        tiempos: {
            start_date: reservation.start_date,
            end_date: reservation.end_date,
            days,
        },
        billing: {
            price_per_day: Number(vehicle.price) || 0,
            insurance_per_day: insurancePlan ? Number(insurancePlan.daily_cost) : 0,
            subtotal_vehicle: reservation.vehicle_subtotal,
            subtotal_insurance: reservation.insurance_subtotal,
            total_price: reservation.total_amount,
            insurance_included: Boolean(reservation.insurance_type_id),
        },
        currency: 'COP',
    };
}

export function toAdminReservationViewModel(reservation, ctx) {
    const { vehiclesById = {}, branchesById = {}, insuranceById = {}, usersById = {}, paymentsByReservation = {}, rentalsByReservation = {}, bankAccountsById = {}, gpsById = {} } = ctx;

    const vehicle = vehiclesById[reservation.vehicle_id] || {};
    const customer = usersById[reservation.client_id] || {};
    const pickupBranch = branchesById[reservation.pickup_branch_id] || {};
    const dropoffBranch = branchesById[reservation.return_branch_id] || {};
    const insurancePlan = insuranceById[reservation.insurance_type_id];
    const payment = paymentsByReservation[reservation.id];
    const rental = rentalsByReservation[reservation.id];
    const bankAccount = payment ? bankAccountsById[payment.bankAccountId] : null;
    const gps = rental ? gpsById[rental.gps_id] : null;

    const durationDays = Math.max(
        1,
        Math.round((new Date(reservation.end_date) - new Date(reservation.start_date)) / (1000 * 60 * 60 * 24))
    );

    return {
        id: reservation.id,
        status: reservation.status,
        rentalSubtotal: reservation.vehicle_subtotal,
        durationDays,
        vehicle: {
            img: vehicle.image || null,
            name: [vehicle.brand, vehicle.model].filter(Boolean).join(' '),
            plate: vehicle.plate,
            category: vehicle.vehicleType,
            fuel: vehicle.fuelType,
            seats: vehicle.capacity,
            mileage: vehicle.mileage || 0,
        },
        customer: {
            // GET /users de iam devuelve camelCase: firstName/lastName/email
            name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username || '',
            email: customer.email ?? '',
            phone: customer.phone ?? '',
        },
        pickup: {
            date: reservation.start_date,
            branchName: pickupBranch.name,
            branchAddress: pickupBranch.address,
        },
        dropoff: {
            date: reservation.end_date,
            branchName: dropoffBranch.name,
            branchAddress: dropoffBranch.address,
        },
        insurance: {
            name: insurancePlan?.name || 'Sin seguro',
            amount: reservation.insurance_subtotal,
        },
        payment: payment ? {
            id: payment.id,
            amount: payment.amount,
            bank: bankAccount?.bankName,
            reference: payment.referenceNumber,
            receivedAt: payment.paymentDate,
            receiptImageUrl: payment.receiptFileUrl,
            uploadedBy: customer.username,
            rejectionReason: payment.rejectionReason,
            reviewedBy: payment.reviewedBy,
            reviewedAt: payment.reviewedAt,
        } : null,
        rental: rental ? {
            id: rental.id,
            status: rental.status,
            pickupMileage: rental.initial_mileage,
            pickupAt: rental.actual_start_date,
            returnMileage: rental.final_mileage,
            returnAt: rental.actual_end_date,
            gpsDevice: gps?.serial || null,
        } : null,
    };
}
