import { Image, Text, View } from "react-native";

import AppCard from "../../../shared/components/AppCard/AppCard";

import { useReservation } from "../../reservation/context/ReservationContext";

import { VEHICLE_IMAGE } from "../../../config/assets";

import { createStyles } from "./VehiclePaymentCard.styles";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

/** Separador de miles es-CO, el mismo que usa el web y el resto del mobile. */
function formatMoney(value: number): string {
    return value.toLocaleString("es-CO");
}

export default function VehiclePaymentCard() {

    const { reservation } = useReservation();

    const { themeName } = useTheme();
    const colors = themes[themeName];

    const styles = createStyles(colors);

    if (!reservation?.vehicle) {
        return null;
    }

    return (

        <AppCard>

            <Image
                source={VEHICLE_IMAGE}
                style={styles.image}
                resizeMode="contain"
            />

            <View style={styles.content}>

                <Text style={styles.name}>
                    {reservation.vehicle.brand} {reservation.vehicle.model}
                </Text>

                <Text style={styles.price}>
                    ${formatMoney(reservation.vehicle.price)} / día
                </Text>

            </View>

        </AppCard>

    );

}