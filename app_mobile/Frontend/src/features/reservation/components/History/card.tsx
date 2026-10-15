import {
    Text,
    View,
} from "react-native";

import {
    Reservation,
} from "../../../../types";

import {
    themes,
} from "../../../../theme/themes";

import {
    useTheme,
} from "../../../../theme/useTheme";

import {
    createStyles,
} from "./ReservationCard.styles";


type Props = {

    reservation: Reservation;

};


export default function ReservationCard({

    reservation,

}: Props) {


    const {
        themeName,
    } = useTheme();


    const colors =
        themes[themeName];


    const styles =
        createStyles(colors);


    return (

        <View
            style={styles.card}
        >

            <View
                style={styles.header}
            >

                <Text
                    style={styles.vehicleName}
                >

                    {
                        reservation.vehicleId
                    }

                </Text>


                <Text style={[styles.status, reservation.status === "CANCELLED" && styles.cancelledStatus, reservation.status === "COMPLETED" && styles.completedStatus]}>

                    {
                        reservation
                            .status
                    }

                </Text>

            </View>


            <View
                style={styles.divider}
            />


            <View
                style={styles.row}
            >

                <Text
                    style={styles.label}
                >

                    Recogida

                </Text>


                <Text
                    style={styles.value}
                >

                    {
                        reservation.pickupBranchId
                    }

                </Text>

            </View>


            <View
                style={styles.row}
            >

                <Text
                    style={styles.label}
                >

                    Devolución

                </Text>


                <Text
                    style={styles.value}
                >

                    {
                        reservation.returnBranchId
                    }

                </Text>

            </View>


            <View
                style={styles.totalContainer}
            >

                <Text
                    style={styles.totalLabel}
                >

                    Total

                </Text>


                <Text
                    style={styles.total}
                >

                    ${reservation.total_price}

                </Text>

            </View>

        </View>

    );

}
