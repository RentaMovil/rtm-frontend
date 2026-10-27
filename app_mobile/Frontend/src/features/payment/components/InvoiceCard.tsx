import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import AppCard from "../../../shared/components/AppCard/AppCard";

import { useReservation } from "../../reservation/context/ReservationContext";

import { calculateDays } from "../utils/calculateDays";
import { calculateInvoiceTotal } from "../utils/calculateInvoiceTotal";

import { getInsuranceOptions } from "../../insurance/services/insuranceService";
import { isAbortError } from "../../../shared/api/httpClient";
import type { InsuranceType } from "../../../types";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles } from "./InvoiceCard.styles";

/** Separador de miles es-CO, el mismo que usa el web y el resto del mobile. */
function formatMoney(value: number): string {
  return value.toLocaleString("es-CO");
}

/**
 * Resumen de factura del pago.
 *
 * El desglose no cambia: mismo calculo que antes. Lo que cambia es la
 * presentacion, alineada con `InvoiceCard.css` del web (separador punteado,
 * total con etiqueta pequena, badge de estado y aviso de monto exacto).
 */
export default function InvoiceCard() {
  const { reservation } = useReservation();

  const { themeName } = useTheme();

  const colors = themes[themeName];
  const styles = createStyles(colors);

  const [isOpen, setIsOpen] = useState(false);

  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceType[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    getInsuranceOptions({ signal: controller.signal })
      .then((loaded) => {
        setInsuranceOptions(loaded);
      })
      .catch((error) => {
        if (!isAbortError(error)) console.error("No se pudieron cargar los seguros.", error);
      });

    return () => controller.abort();
  }, []);

  if (!reservation?.vehicle) {
    return null;
  }

  const vehicle = reservation.vehicle;

  const days = calculateDays(
    reservation.pickupDate,
    reservation.returnDate,
  );

  const selectedInsurance = insuranceOptions.find(
    (item) => item.id === reservation.insuranceTypeId,
  );

  const vehicleTotal = days * vehicle.price;
  const insuranceTotal = selectedInsurance?.price ?? 0;

  const total = calculateInvoiceTotal(days, vehicle, selectedInsurance);

  return (
    <AppCard>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <View style={styles.dot} />

            <Text style={styles.title}>Resumen de factura</Text>
          </View>

          <Text style={styles.subtitle}>Detalle de tu reserva</Text>
        </View>

        <FontAwesome
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.button}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.content}>
          <View style={styles.vehicleSection}>
            <Text style={styles.vehicleName}>{vehicle.brand}</Text>

            <Text style={styles.vehicleDescription}>
              Alquiler del vehículo
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Alquiler</Text>

              <Text style={styles.description}>
                {days} día{days !== 1 ? "s" : ""}
              </Text>
            </View>

            <Text style={styles.value}>${formatMoney(vehicleTotal)}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Seguro</Text>

              <Text style={styles.description}>
                {selectedInsurance ? selectedInsurance.name : "Sin seguro"}
              </Text>
            </View>

            <Text style={styles.value}>${formatMoney(insuranceTotal)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.totalRow}>
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
            </View>

            <Text style={styles.total}>${formatMoney(total)}</Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>Monto exacto requerido</Text>
          </View>

          <View style={styles.warningBox}>
            <FontAwesome
              name="exclamation-triangle"
              size={15}
              color={colors.textHeading}
              style={styles.warningIcon}
            />

            <Text style={styles.warningText}>
              Transfiere el monto exacto. El pago se revisa a mano y un
              administrador confirmara o rechazara la operacion.
            </Text>
          </View>
        </View>
      )}
    </AppCard>
  );
}
