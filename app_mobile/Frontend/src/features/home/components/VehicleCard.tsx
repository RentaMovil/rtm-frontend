import { useTranslation } from "react-i18next";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { Vehicle } from "../../../types/vehicle";

import { VEHICLE_IMAGE } from "../../../config/assets";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles } from "./Card.styles";

type Props = {
  vehicle: Vehicle;
  onContinue: (vehicle: Vehicle) => void;
};

/**
 * Separador de miles es-TH, el mismo que usa el web (`toLocaleString("es-CO")`).
 * Sin esto, 100000 se veria como "100000" en vez de "100.000".
 */
function formatMoney(value: number): string {
  return value.toLocaleString("es-CO");
}

export default function VehicleCard({ vehicle, onContinue }: Props) {
  const { t } = useTranslation();

  const { themeName } = useTheme();

  const colors = themes[themeName as keyof typeof themes];

  const styles = createStyles(colors);

  /**
   * `Vehicle` no tiene campo `available` (existe en `VehicleFilters`, que es
   * otra cosa), asi que la disponibilidad se deduce del `status`, que si
   * llega desde la API. Asi el distintivo no promete un vehiculo en
   * mantenimiento.
   */
  const isAvailable = !/mantenimiento/i.test(vehicle.status ?? "");

  const specs = [
    {
      key: "passengers",
      value: `${vehicle.capacity}`,
      unit: t("cartVehicule.capacity"),
    },
    { key: "fuel", value: vehicle.fuelType, unit: null },
    { key: "mileage", value: formatMoney(vehicle.mileage), unit: "km" },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>
          {vehicle.brand} {vehicle.model}
        </Text>

        {isAvailable && (
          <View style={styles.verifiedBadge}>
            <FontAwesome name="check" size={12} color={colors.backgroundCard} />
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>
        {vehicle.vehicleType} • {t("cartVehicule.year")} {vehicle.year}
      </Text>

      <View style={styles.imageBox}>
        <Image
          source={VEHICLE_IMAGE}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.specsBar}>
        {specs.map((spec, index) => (
          <View
            key={spec.key}
            style={[
              styles.spec,
              index < specs.length - 1 && styles.specDivider,
            ]}
          >
            <FontAwesome
              name={
                spec.key === "passengers"
                  ? "users"
                  : spec.key === "fuel"
                    ? "tint"
                    : "tachometer"
              }
              size={15}
              color={colors.button}
            />

            <Text style={styles.specValue}>
              {spec.value} {spec.unit}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.locationRow}>
          <FontAwesome
            name="map-marker"
            size={15}
            color={colors.button}
          />

          <Text style={styles.location}>
            {t("cartVehicule.location")}, {vehicle.location}
          </Text>
        </View>

        <View style={styles.freeCancel}>
          <FontAwesome name="check" size={11} color={colors.success} />

          <Text style={styles.freeCancelText}>
            {t("cartVehicule.cancellation")}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>$ {formatMoney(vehicle.price)}</Text>

          <Text style={styles.priceLabel}>
            COP / {t("cartVehicule.perDay")}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => onContinue(vehicle)}
        >
          <Text style={styles.buttonText}>{t("cartVehicule.rent")}</Text>

          <FontAwesome
            name="arrow-right"
            size={15}
            color={colors.buttonText}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
