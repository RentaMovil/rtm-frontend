import { Image, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import AppCard from "../../../shared/components/AppCard/AppCard";

import { Vehicle } from "../../../types/vehicle";

import { VEHICLE_IMAGE } from "../../../config/assets";

import { createStyles } from "./VehicleSummaryCard.styles";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { useTranslation } from "react-i18next";

    type Props = {
    readonly vehicle: Vehicle;
    };

    export default function VehicleSummaryCard({
    vehicle,
    }: Props) {
    const { t } = useTranslation();

    const { themeName } = useTheme();

    const colors = themes[themeName];

    const styles = createStyles(colors);

    // Antes eran emoji (🚗 ⛽ 💺 📅). FontAwesome da el mismo lenguaje visual
    // que el resto de la app y, a diferencia del emoji, no cambia de aspecto
    // entre plataformas Android e iOS.
    const specs = [
        { key: "type", icon: "car", label: vehicle.vehicleType },
        { key: "fuel", icon: "tint", label: vehicle.fuelType },
        {
            key: "capacity",
            icon: "users",
            label: `${vehicle.capacity} ${t("cartVehicule.capacity")}`,
        },
        {
            key: "year",
            icon: "calendar",
            label: `${vehicle.year} ${t("cartVehicule.year")}`,
        },
    ] as const;

    return (
<AppCard>

    <Image
        source={VEHICLE_IMAGE}
        style={styles.image}
    />

    <View style={styles.content}>

        <Text style={styles.name}>
            {vehicle.brand} {vehicle.model}
        </Text>

        <Text style={styles.model}>
            {vehicle.brand} • {vehicle.model}
        </Text>

        <View style={styles.infoContainer}>
            {specs.map((spec) => (
                <View key={spec.key} style={styles.badge}>
                    <FontAwesome
                        name={spec.icon}
                        size={16}
                        color={colors.button}
                        style={styles.badgeIcon}
                    />

                    <Text style={styles.badgeText}>{spec.label}</Text>
                </View>
            ))}
        </View>

        <Text style={styles.price}>
            ${vehicle.price.toLocaleString()} COP / día
        </Text>

    </View>

</AppCard>
  );
}