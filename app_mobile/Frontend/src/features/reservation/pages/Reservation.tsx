import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { useReservation } from "../context/ReservationContext";

import ContinueButton from "../../../shared/components/Button/ContinueButton";
import BranchSelectorModal from "../components/BranchSelectorModal";
import InsuranceSelector from "../components/InsuranceSelector";
import ReservationInfoCard from "../components/ReservationInfoCard";
import TermsCheckbox from "../components/TermsCheckbox";
import VehicleSummaryCard from "../components/VehicleSummaryCard";

import { getBranches } from "../../branches/services/branchService";
import { getInsuranceOptions } from "../../insurance/services/insuranceService";

import { createReservation } from "../services/reservationService";
import { buildReservationRequest } from "../utils/buildReservationRequest";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles } from "./Reservation.styles";

import type { InsuranceType } from "../../../types";
import type { Branch } from "../../../types/branch";
import { useAuth } from "../../auth/context/AuthContext";
export default function ReservationPage() {
  const {
    reservation,
    updateReturnBranch,
    updateTermsAccepted,
    setCreatedReservation,
  } = useReservation();

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);
  const { user } = useAuth();
  
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceType[]>([]);

  useEffect(() => {
    let cancelled = false;

    getBranches().then((loaded) => {
      if (!cancelled) {
        setBranchOptions(loaded);
      }
    });

    getInsuranceOptions().then((loaded) => {
      if (!cancelled) {
        setInsuranceOptions(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangePickup = () => {
    // Volver al home para cambiar la sucursal/fecha de recogida.
    router.push("/");
  };

  /**
   * Crea la reserva y avanza al paso de pago.
   *
   * La reserva se persiste AQUI, no en la pantalla de pago: segun el dominio
   * nace en PENDING_PAYMENT y el pago es un agregado aparte. Por eso esta
   * pantalla no exige metodo de pago ni lo necesita para continuar.
   */
  const handleContinue = async () => {
    if (!reservation || isCreating || !reservation.termsAccepted) return;

    setIsCreating(true);

    try {
      const created = await createReservation(buildReservationRequest(reservation), user!.id);
      setCreatedReservation(created);

      router.push("/payment");
    } catch (error) {
      console.log("Error creando la reserva:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!reservation?.vehicle) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No hay una reserva activa</Text>

        <Text style={styles.emptyText}>
          Elige un vehiculo para empezar una reserva.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <VehicleSummaryCard vehicle={reservation.vehicle} />

      <ReservationInfoCard
        title="Tu reserva"
        subtitle="Revisa los datos antes de continuar"
        onChangePickup={handleChangePickup}
        onChangeReturnBranch={() => setShowReturnModal(true)}
      />

      <BranchSelectorModal
        visible={showReturnModal}
        branches={branchOptions}
        onClose={() => setShowReturnModal(false)}
        onSelect={(branch) => updateReturnBranch(branch)}
      />

      <InsuranceSelector options={insuranceOptions} />

      <TermsCheckbox
        checked={reservation.termsAccepted}
        onToggle={updateTermsAccepted}
      />

      <ContinueButton
        title={isCreating ? "Creando reserva..." : "Continuar"}
        onPress={handleContinue}
        disabled={!reservation.termsAccepted || isCreating}
      />
    </ScrollView>
  );
}
