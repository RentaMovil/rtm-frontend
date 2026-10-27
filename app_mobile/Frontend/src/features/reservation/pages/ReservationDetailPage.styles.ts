import { StyleSheet } from "react-native";

import { Spacing } from "../../../theme/constants/spacing";
import { Radius } from "../../../theme/constants/radius";

export function createStyles(colors: any) {
    return StyleSheet.create({
        container: {
            flexGrow: 1,
            gap: Spacing.lg,
            padding: Spacing.lg,
            backgroundColor: colors.background,
        },

        stateContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 24,
            backgroundColor: colors.background,
        },

        stateTitle: {
            fontSize: 21,
            fontWeight: "700",
            color: colors.text,
        },

        stateText: {
            fontSize: 15,
            textAlign: "center",
            color: colors.secondaryText,
        },

        backButton: {
            marginTop: 8,
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: colors.button,
        },

        backButtonText: {
            fontWeight: "700",
            color: colors.buttonText,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
        },

        title: {
            flex: 1,
            fontSize: 26,
            fontWeight: "800",
            color: colors.text,
        },

        statusBadge: {
            marginLeft: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
        },

        statusText: {
            fontSize: 12,
            fontWeight: "700",
        },

        // El verde (`success`/`successSurface`) se reserva para el unico
        // estado que realmente es positivo: CONFIRMED. PENDING_* usa el
        // acento neutro (el mismo tono que el resto de badges/botones de
        // acento), COMPLETED el primario y CANCELLED el error — igual que ya
        // distingue `ReservationCard` en el historial.
        statusBadgePending: { backgroundColor: colors.accentBg },
        statusTextPending: { color: colors.primaryDark },

        statusBadgeConfirmed: { backgroundColor: colors.successSurface },
        statusTextConfirmed: { color: colors.success },

        statusBadgeCompleted: { backgroundColor: colors.primarySurface },
        statusTextCompleted: { color: colors.primary },

        statusBadgeCancelled: { backgroundColor: colors.errorSurface },
        statusTextCancelled: { color: colors.error },

        card: {
            padding: Spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: Radius.lg,
            backgroundColor: colors.card,
        },

        sectionTitle: {
            marginBottom: 12,
            fontSize: 14,
            fontWeight: "700",
            letterSpacing: 0.7,
            textTransform: "uppercase",
            color: colors.secondaryText,
        },

        vehicleName: {
            fontSize: 21,
            fontWeight: "700",
            color: colors.text,
        },

        // Fila icono + nombre del vehiculo en el card de detalles.
        vehicleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },

        detailRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 18,
            paddingVertical: 13,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },

        lastDetailRow: {
            paddingBottom: 0,
            borderBottomWidth: 0,
        },

        detailLabel: {
            flex: 1,
            fontSize: 14,
            color: colors.text,
        },

        detailValue: {
            flex: 1.25,
            fontSize: 14,
            fontWeight: "600",
            textAlign: "right",
            color: colors.text,
        },

        totalCard: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 18,
            borderRadius: 16,
            backgroundColor: colors.button,
        },

        totalLabel: {
            fontSize: 15,
            fontWeight: "600",
            color: colors.buttonText,
        },

        totalAmount: {
            fontSize: 24,
            fontWeight: "800",
            color: colors.buttonText,
        },

        // Fila de sucursal (recogida/devolución), con accion opcional de cambio
        branchRow: {
            paddingVertical: 13,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 4,
        },

        branchRowHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 18,
        },

        branchLabel: {
            flex: 1,
            fontSize: 14,
            color: colors.text,
        },

        branchInfo: {
            flex: 1.25,
            alignItems: "flex-end",
        },

        branchName: {
            fontSize: 14,
            fontWeight: "600",
            textAlign: "right",
            color: colors.text,
        },

        branchAddress: {
            marginTop: 2,
            fontSize: 12,
            textAlign: "right",
            color: colors.secondaryText,
        },

        branchActionLink: {
            marginTop: 6,
            fontSize: 13,
            fontWeight: "700",
            color: colors.button,
        },

        branchHelperText: {
            marginTop: 2,
            fontSize: 12,
            textAlign: "right",
            color: colors.secondaryText,
        },

        uploadReceiptButton: {
            alignItems: "center",
            padding: 15,
            borderRadius: 12,
            marginBottom: 12,
            backgroundColor: colors.button,
        },

        uploadReceiptButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colors.buttonText,
        },

        // Acción de cancelación
        cancelButton: {
            alignItems: "center",
            padding: 15,
            borderWidth: 1,
            borderColor: colors.error,
            borderRadius: 12,
            backgroundColor: colors.card,
        },

        cancelButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colors.error,
        },

        cancelButtonDisabled: {
            borderColor: colors.border,
            opacity: 0.6,
        },

        cancelButtonTextDisabled: {
            color: colors.secondaryText,
        },

        cancelReasonText: {
            marginTop: 8,
            fontSize: 13,
            textAlign: "center",
            color: colors.secondaryText,
        },

        // Modal de confirmación
        modalOverlay: {
            flex: 1,
            justifyContent: "center",
            padding: 24,
            backgroundColor: colors.overlay,
        },

        modalContent: {
            padding: 24,
            borderRadius: 20,
            backgroundColor: colors.card,
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 12,
        },

        modalIcon: {
            width: 46,
            height: 46,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            borderRadius: 23,
            backgroundColor: colors.errorSurface,
        },

        modalIconText: {
            fontSize: 27,
            fontWeight: "800",
            color: colors.error,
        },

        modalTitle: {
            marginBottom: 8,
            fontSize: 22,
            fontWeight: "800",
            textAlign: "center",
            color: colors.text,
        },

        modalMessage: {
            fontSize: 15,
            lineHeight: 22,
            textAlign: "center",
            color: colors.secondaryText,
        },

        modalActions: {
            gap: 10,
            marginTop: 24,
        },

        keepButton: {
            alignItems: "center",
            padding: 13,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 11,
        },

        keepButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colors.text,
        },

        confirmCancelButton: {
            alignItems: "center",
            padding: 14,
            borderRadius: 11,
            backgroundColor: colors.error,
        },

        confirmCancelButtonText: {
            fontSize: 15,
            fontWeight: "700",
            color: colors.buttonText,
        },

        disabledButton: {
            opacity: 0.65,
        },
    });
}
