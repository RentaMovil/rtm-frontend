import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { appAlert } from "../../../shared/components/Alert/AppAlert";
import {
    RESERVATION_STATUS,
} from "../../../types";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import type { Branch, Reservation } from "../../../types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ApiError, isAbortError } from "../../../shared/api/httpClient";
import { getBranchById, getBranches } from "../../branches/services/branchService";
import BranchSelectorModal from "../components/BranchSelectorModal";
import UploadReceiptModal from "../../payment/components/UploadReceiptModal";
import {
    cancelReservation,
    getReservationById,
    updateReturnBranch,
} from "../services/reservationService";
import { formatReservationDateTime, parseReservationDateTime, wallClockNow } from "../utils/formatReservationDate";
import { createStyles } from "./ReservationDetailPage.styles";

/**
 * Estados "vigentes" de una reserva (ver `Reservation.java`, javadoc de
 * `changeReturnBranch` y `canTransitionTo`): son los unicos desde los que se
 * puede cancelar o modificar. Una vez CANCELLED/COMPLETED, ninguna de las
 * dos acciones esta disponible.
 */
const ACTIVE_STATUSES: readonly string[] = [
    RESERVATION_STATUS.PENDING_PAYMENT,
    RESERVATION_STATUS.PENDING_REVIEW,
    RESERVATION_STATUS.CONFIRMED,
];

/** INV-004: cancelar solo hasta 3 dias antes de `start_date`. */
const CANCELLATION_WINDOW_DAYS = 3;
/** INV-013: cambiar la sucursal de devolucion solo hasta 3 dias antes de `end_date`. */
const RETURN_BRANCH_WINDOW_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

// Etiquetas de display sobre los valores de `RESERVATION_STATUS`. El texto va
// en espanol (es lo que ve el usuario) pero la clave es el valor del dominio,
// para que el mock y el codigo no se separen.
const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: "Pendiente de pago",
    PENDING_REVIEW: "Pago en revision",
    CONFIRMED: "Confirmada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
};

/**
 * Estilo del badge de estado, por estado.
 *
 * Antes solo distinguia CANCELLED (rojo) del resto (siempre verde/success).
 * Eso pintaba "Pendiente de pago" y "Pago en revision" -que no son un
 * resultado positivo, solo estados de transito- con el mismo verde que una
 * reserva ya CONFIRMED. El verde queda reservado para el unico estado que
 * realmente es positivo (CONFIRMED); pendientes usan el acento neutro y
 * COMPLETED el primario, igual que ya distingue `ReservationCard` (historial).
 */
const statusBadgeStyleKey: Record<string, "pending" | "confirmed" | "completed" | "cancelled"> = {
    PENDING_PAYMENT: "pending",
    PENDING_REVIEW: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export default function ReservationDetailPage() {
    const { id } = useLocalSearchParams();
    const { t } = useTranslation();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);

    // La reserva guarda solo ids (vehicleId, pickupBranchId,
    // returnBranchId). El vehiculo viene de la API y las sucursales del
    // catalogo, asi que se resuelven aqui para poder pintar los nombres.
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const { themeName } = useTheme();
    const colors = themes[themeName];
    const styles = createStyles(colors);
    const [pickupBranch, setPickupBranch] = useState<Branch | null>(null);
    const [returnBranch, setReturnBranch] = useState<Branch | null>(null);
    const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
    const [isReturnBranchModalVisible, setIsReturnBranchModalVisible] = useState(false);
    const [isUpdatingReturnBranch, setIsUpdatingReturnBranch] = useState(false);
    const [isUploadReceiptModalVisible, setIsUploadReceiptModalVisible] = useState(false);

    // Guardas sincronas (ademas del estado) contra doble solicitud: dos taps
    // seguidos pueden disparar dos llamadas antes de que el primer
    // `setState` re-renderice y deshabilite el boton.
    const cancelInFlightRef = useRef(false);
    const returnBranchInFlightRef = useRef(false);

    useEffect(() => {
        if (!reservation) return;
        let cancelled = false;
        getBranchById(reservation.pickupBranchId).then((branch) => {
            if (!cancelled) setPickupBranch(branch);
        });
        getBranchById(reservation.returnBranchId).then((branch) => {
            if (!cancelled) setReturnBranch(branch);
        });
        return () => { cancelled = true; };
    }, [reservation]);

    useEffect(() => {
        const controller = new AbortController();

        getBranches({ signal: controller.signal })
            .then(setBranchOptions)
            .catch((error) => {
                if (!isAbortError(error)) console.error("No se pudieron cargar las sucursales.", error);
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadReservation(signal: AbortSignal) {
            // Nuevo id (p. ej. se volvio a esta misma pantalla desde el
            // historial con otra reserva): se limpia el estado de acciones
            // en curso de la reserva anterior.
            setIsCancelModalVisible(false);
            setIsCancelling(false);
            setIsReturnBranchModalVisible(false);
            setIsUpdatingReturnBranch(false);
            cancelInFlightRef.current = false;
            returnBranchInFlightRef.current = false;

            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const data = await getReservationById(String(id), { signal });
                setReservation(data ?? null);
            } catch (error) {
                if (!isAbortError(error)) console.log("Error cargando reserva:", error);
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        }

        void loadReservation(controller.signal);
        return () => controller.abort();
    }, [id]);

    async function handleCancelReservation() {
        if (!reservation || cancelInFlightRef.current) return;

        cancelInFlightRef.current = true;
        setIsCancelling(true);

        try {
            const updatedReservation = await cancelReservation(reservation.id);

            if (!updatedReservation) {
            appAlert.alert(t("common.error"), t("reservationDetail.notFound"));
                return;
            }

            // La UI solo se actualiza tras confirmar la respuesta exitosa
            // del backend: nunca se marca como cancelada de forma optimista.
            setReservation(updatedReservation);
            setIsCancelModalVisible(false);
            appAlert.alert(t("reservationDetail.cancelledTitle"), t("reservationDetail.cancelledMessage"));
        } catch (error) {
            console.error("Error cancelando reserva:", error);
            const message =
                error instanceof ApiError
                    ? error.message
                    : t("reservationDetail.cancelErrorMessage");
            appAlert.alert(t("reservationDetail.cancelErrorTitle"), message);
        } finally {
            setIsCancelling(false);
            cancelInFlightRef.current = false;
        }
    }

    async function handleUploadReceiptSuccess() {
        setIsUploadReceiptModalVisible(false);

        try {
            const updated = await getReservationById(String(id));
            setReservation(updated ?? null);
        } catch (error) {
            console.error("Error recargando reserva tras subir el comprobante:", error);
        }
    }

    async function handleSelectReturnBranch(branch: Branch) {
        if (!reservation || returnBranchInFlightRef.current) return;

        if (branch.id === reservation.returnBranchId) {
            setIsReturnBranchModalVisible(false);
            return;
        }

        returnBranchInFlightRef.current = true;
        setIsUpdatingReturnBranch(true);

        try {
            const updated = await updateReturnBranch(reservation.id, branch.id);

            // Igual que al cancelar: solo se refleja el cambio cuando el
            // backend confirma que lo aplico.
            setReservation(updated);
            setIsReturnBranchModalVisible(false);
        } catch (error) {
            console.error("Error actualizando sucursal de devolución:", error);
            const message =
                error instanceof ApiError
                    ? error.message
                    : t("reservationDetail.returnBranchErrorMessage");
            appAlert.alert(t("reservationDetail.returnBranchErrorTitle"), message);
        } finally {
            setIsUpdatingReturnBranch(false);
            returnBranchInFlightRef.current = false;
        }
    }

    if (loading) {
        return (
            <View style={styles.stateContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.stateText}>Cargando reserva...</Text>
            </View>
        );
    }

    if (!reservation) {
        return (
            <View style={styles.stateContainer}>
                <Text style={styles.stateTitle}>Reserva no encontrada</Text>
                <Text style={styles.stateText}>No pudimos cargar los detalles de esta reserva.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusKey = statusBadgeStyleKey[reservation.status] ?? "pending";
    const statusBadgeVariants = {
        pending: { badge: styles.statusBadgePending, text: styles.statusTextPending },
        confirmed: { badge: styles.statusBadgeConfirmed, text: styles.statusTextConfirmed },
        completed: { badge: styles.statusBadgeCompleted, text: styles.statusTextCompleted },
        cancelled: { badge: styles.statusBadgeCancelled, text: styles.statusTextCancelled },
    } as const;

    const isActiveStatus = ACTIVE_STATUSES.includes(reservation.status);

    // Ventanas de tiempo (ver `Reservation.java`): se replican aqui solo para
    // habilitar/deshabilitar la UI con una razon clara. El backend sigue
    // siendo quien valida de verdad; si el reloj del dispositivo esta
    // desincronizado, la peticion real fallara y se muestra su mensaje.
    const startDate = parseReservationDateTime(reservation.start_date);
    const isWithinCancellationWindow =
        !startDate || wallClockNow().getTime() <= startDate.getTime() - CANCELLATION_WINDOW_DAYS * DAY_MS;
    // ADR-015: el cliente no puede cancelar una reserva. Se oculta el boton; el backend aun conserva
    // POST /reservations/{id}/cancel y debe retirarse aparte.
    const customerCancellationEnabled = false;
    const canCancel = isActiveStatus && isWithinCancellationWindow;

    let cancelDisabledReason: string | null = null;
    if (reservation.status === RESERVATION_STATUS.COMPLETED) {
        cancelDisabledReason = "Esta reserva ya se completó y no se puede cancelar.";
    } else if (isActiveStatus && !isWithinCancellationWindow) {
        cancelDisabledReason = "Ya no se puede cancelar: el plazo límite era 3 días antes de la fecha de recogida.";
    }

    const endDate = parseReservationDateTime(reservation.end_date);
    const isWithinReturnBranchWindow =
        !endDate || wallClockNow().getTime() <= endDate.getTime() - RETURN_BRANCH_WINDOW_DAYS * DAY_MS;
    const canChangeReturnBranch = isActiveStatus && isWithinReturnBranchWindow;

    let returnBranchDisabledReason: string | null = null;
    if (!isActiveStatus) {
        returnBranchDisabledReason =
            reservation.status === RESERVATION_STATUS.CANCELLED
                ? "Una reserva cancelada ya no se puede modificar."
                : "Una reserva completada ya no se puede modificar.";
    } else if (!isWithinReturnBranchWindow) {
        returnBranchDisabledReason =
            "La sucursal de devolución ya no se puede cambiar: el plazo límite era 3 días antes de la devolución.";
    }

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Detalle de la reserva</Text>
                    <View style={[styles.statusBadge, statusBadgeVariants[statusKey].badge]}>
                        <Text style={[styles.statusText, statusBadgeVariants[statusKey].text]}>
                            {statusLabels[reservation.status]}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Vehículo</Text>

                    {/* Icono del vehiculo, mismo lenguaje visual que los
                        badges de `VehicleSummaryCard` (icono en `button`). */}
                    <View style={styles.vehicleRow}>
                        <FontAwesome
                            name="car"
                            size={18}
                            color={colors.button}
                        />
                        <Text style={styles.vehicleName}>
                            Vehículo no disponible
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Información del viaje</Text>

                    <BranchRow
                        label="Recogida"
                        branch={pickupBranch}
                        styles={styles}
                        helperText="No se puede cambiar una vez creada la reserva."
                    />

                    <BranchRow
                        label="Devolución"
                        branch={returnBranch}
                        styles={styles}
                        onChangePress={canChangeReturnBranch ? () => setIsReturnBranchModalVisible(true) : undefined}
                        helperText={!canChangeReturnBranch ? returnBranchDisabledReason : null}
                        isUpdating={isUpdatingReturnBranch}
                    />

                    <DetailRow label="Fecha de recogida" value={formatReservationDateTime(reservation.start_date)} styles={styles} />
                    <DetailRow label="Fecha de devolución" value={formatReservationDateTime(reservation.end_date)} styles={styles} last />
                </View>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total a pagar</Text>
                    <Text style={styles.totalAmount}>${reservation.total_price.toLocaleString()}</Text>
                </View>

                {reservation.status === RESERVATION_STATUS.PENDING_PAYMENT && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Subir comprobante"
                        activeOpacity={0.85}
                        style={styles.uploadReceiptButton}
                        onPress={() => setIsUploadReceiptModalVisible(true)}
                    >
                        <Text style={styles.uploadReceiptButtonText}>Subir comprobante</Text>
                    </TouchableOpacity>
                )}

                {customerCancellationEnabled && reservation.status !== RESERVATION_STATUS.CANCELLED && (
                    canCancel ? (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar reserva"
                            activeOpacity={0.85}
                            style={styles.cancelButton}
                            onPress={() => setIsCancelModalVisible(true)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar reserva</Text>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <TouchableOpacity
                                disabled
                                accessibilityRole="button"
                                accessibilityLabel="Cancelar reserva (no disponible)"
                                accessibilityState={{ disabled: true }}
                                style={[styles.cancelButton, styles.cancelButtonDisabled]}
                            >
                                <Text style={[styles.cancelButtonText, styles.cancelButtonTextDisabled]}>
                                    Cancelar reserva
                                </Text>
                            </TouchableOpacity>

                            {cancelDisabledReason && (
                                <Text style={styles.cancelReasonText}>{cancelDisabledReason}</Text>
                            )}
                        </View>
                    )
                )}
            </ScrollView>

            <Modal
                visible={isCancelModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => !isCancelling && setIsCancelModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => !isCancelling && setIsCancelModalVisible(false)}
                >
                    <Pressable style={styles.modalContent} onPress={(event) => event.stopPropagation()}>
                        <View style={styles.modalIcon}>
                            <Text style={styles.modalIconText}>!</Text>
                        </View>
                        <Text style={styles.modalTitle}>¿Cancelar reserva?</Text>
                        <Text style={styles.modalMessage}>
                            ¿De verdad quieres cancelar la reserva de {reservation.vehicleId}? Esta acción no se puede deshacer.
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                disabled={isCancelling}
                                style={styles.keepButton}
                                onPress={() => setIsCancelModalVisible(false)}
                            >
                                <Text style={styles.keepButtonText}>Conservar reserva</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={isCancelling}
                                style={[styles.confirmCancelButton, isCancelling && styles.disabledButton]}
                                onPress={handleCancelReservation}
                            >
                                <Text style={styles.confirmCancelButtonText}>
                                    {isCancelling ? "Cancelando..." : "Sí, cancelar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <BranchSelectorModal
                visible={isReturnBranchModalVisible}
                branches={branchOptions}
                onClose={() => !isUpdatingReturnBranch && setIsReturnBranchModalVisible(false)}
                onSelect={handleSelectReturnBranch}
            />

            <UploadReceiptModal
                visible={isUploadReceiptModalVisible}
                reservationId={reservation.id}
                amount={reservation.total_price}
                onClose={() => setIsUploadReceiptModalVisible(false)}
                onSuccess={handleUploadReceiptSuccess}
            />
        </>
    );
}

function BranchRow({
    label,
    branch,
    styles,
    onChangePress,
    helperText,
    isUpdating = false,
}: {
    label: string;
    branch: Branch | null;
    styles: ReturnType<typeof createStyles>;
    onChangePress?: () => void;
    helperText?: string | null;
    isUpdating?: boolean;
}) {
    return (
        <View style={styles.branchRow}>
            <View style={styles.branchRowHeader}>
                <Text style={styles.branchLabel}>{label}</Text>

                <View style={styles.branchInfo}>
                    <Text style={styles.branchName}>{branch?.name ?? "Sucursal no disponible"}</Text>
                    {branch?.address ? <Text style={styles.branchAddress}>{branch.address}</Text> : null}

                    {onChangePress ? (
                        <TouchableOpacity
                            onPress={onChangePress}
                            disabled={isUpdating}
                            accessibilityRole="button"
                            accessibilityLabel={`Cambiar ${label.toLowerCase()}`}
                        >
                            <Text style={styles.branchActionLink}>
                                {isUpdating ? "Actualizando..." : "Cambiar"}
                            </Text>
                        </TouchableOpacity>
                    ) : helperText ? (
                        <Text style={styles.branchHelperText}>{helperText}</Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

function DetailRow({
    label,
    value,
    styles,
    last = false,
}: {
    label: string;
    value: string;
    styles: ReturnType<typeof createStyles>;
    last?: boolean;
}) {
    return (
        <View style={[styles.detailRow, last && styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}
