import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    RESERVATION_STATUS,
} from "../../../types";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import type { Branch, Reservation, Vehicle } from "../../../types";
import { getBranchById } from "../../branches/services/branchService";
import {
    cancelReservation,
    getReservationById,
} from "../services/reservationService";
import { createStyles } from "./ReservationDetailPage.styles";

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

export default function ReservationDetailPage() {
    const { id } = useLocalSearchParams();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);

    // La reserva guarda solo ids (vehicleId, pickupBranchId,
    // returnBranchId). El vehiculo viene de la API y las sucursales del
    // catalogo, asi que se resuelven aqui para poder pintar los nombres.
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const { themeName } = useTheme();
    const colors = themes[themeName];
    const styles = createStyles(colors);
    const [pickupBranch, setPickupBranch] = useState<Branch | null>(null);
    const [returnBranch, setReturnBranch] = useState<Branch | null>(null);

    useEffect(() => {
        if (!reservation) return;
        getBranchById(reservation.pickupBranchId).then(setPickupBranch);
        getBranchById(reservation.returnBranchId).then(setReturnBranch);
    }, [reservation]);
    
    useEffect(() => {
        async function loadReservation() {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const data = await getReservationById(String(id));
                setReservation(data ?? null);
            } catch (error) {
                console.log("Error cargando reserva:", error);
            } finally {
                setLoading(false);
            }
        }

        loadReservation();
    }, [id]);

    async function handleCancelReservation() {
        if (!reservation || isCancelling) return;

        setIsCancelling(true);

        try {
            const updatedReservation = await cancelReservation(reservation.id);

            if (!updatedReservation) {
                Alert.alert("Error", "No se encontró la reserva.");
                return;
            }

            setReservation(updatedReservation);
            setIsCancelModalVisible(false);
            Alert.alert("Reserva cancelada", "Tu reserva ha sido cancelada correctamente.");
        } catch (error) {
            console.log("Error cancelando reserva:", error);
            Alert.alert("Error", "No fue posible cancelar la reserva.");
        } finally {
            setIsCancelling(false);
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

    const canCancel =
        reservation.status === RESERVATION_STATUS.PENDING_PAYMENT ||
        reservation.status === RESERVATION_STATUS.CONFIRMED;

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Detalle de la reserva</Text>
                    <View style={[styles.statusBadge, reservation.status === RESERVATION_STATUS.CANCELLED && styles.cancelledBadge]}>
                        <Text style={[styles.statusText, reservation.status === RESERVATION_STATUS.CANCELLED && styles.cancelledStatusText]}>
                            {statusLabels[reservation.status]}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Vehículo</Text>
                    <Text style={styles.vehicleName}>{vehicle ? `${vehicle.brand} ${vehicle.model}` : "Vehiculo no disponible"}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Información del viaje</Text>
                    <DetailRow label="Recogida" value={pickupBranch?.name ?? "-"} styles={styles} />
                    <DetailRow label="Devolución" value={returnBranch?.name ?? "-"} styles={styles} />
                    <DetailRow label="Fecha de recogida" value={reservation.start_date} styles={styles} />
                    <DetailRow label="Fecha de devolución" value={reservation.end_date} styles={styles} last />
                </View>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total a pagar</Text>
                    <Text style={styles.totalAmount}>${reservation.total_price.toLocaleString()}</Text>
                </View>

                {canCancel && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar reserva"
                        activeOpacity={0.85}
                        style={styles.cancelButton}
                        onPress={() => setIsCancelModalVisible(true)}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar reserva</Text>
                    </TouchableOpacity>
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
                            ¿De verdad quieres cancelar la reserva de {vehicle ? `${vehicle.brand} ${vehicle.model}` : reservation.vehicleId}? Esta acción no se puede deshacer.
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
        </>
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
