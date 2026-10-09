import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import {
    router,
} from "expo-router";

import {
    createStyles,
} from "./ReservationHistory.styles";

import {
    themes,
} from "../../../theme/themes";

import {
    useTheme,
} from "../../../theme/useTheme";

import { useAuth } from "../../auth/context/AuthContext";
import {
    getMyReservations,
} from "../services/reservationService";

import {
    Reservation,
} from "../../../types";

import ReservationCard from "../components/History/card";

import ReservationFilters from "../components/Filter";

import {
    useReservationFilters,
} from "../hooks/useReservationFilter";


export default function ReservationHistoryScreen() {

    const { user } = useAuth();

    const [

        reservations,

        setReservations,

    ] = useState<Reservation[]>([]);


    const [

        loading,

        setLoading,

    ] = useState(true);


    const {

        selectedFilter,

        setSelectedFilter,

        filteredReservations,

    } = useReservationFilters(
        reservations
    );


    const {

        themeName,

    } = useTheme();


    const colors =
        themes[themeName];


    const styles =
        createStyles(colors);


    useEffect(() => {

        async function loadReservations() {

            if (!user?.id) {
                setReservations([]);
                setLoading(false);
                return;
            }

            try {

                const data =
                    await getMyReservations(user.id);

                setReservations(data);

            } catch (error) {

                console.log(
                    "Error cargando reservas:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }

        loadReservations();

    }, [user?.id]);


    function handlePress(
        reservationId: string
    ) {

        router.push({

            pathname:
                "/reservation-detail",

            params: {

                id: reservationId,

            },

        });

    }


    if (loading) {

        return (

            <View style={styles.loadingContainer}>

                <Text>

                    Cargando reservas...

                </Text>

            </View>

        );

    }


    return (

        <ScrollView contentContainerStyle={styles.screen}>

            <View
                style={styles.container}
            >

                <Text style={styles.eyebrow}>TU ACTIVIDAD</Text>
                <Text style={styles.title}>Mis reservas</Text>
                <Text style={styles.subtitle}>Consulta y administra tus próximos viajes.</Text>
                <Text style={styles.count}>{reservations.length} reserva{reservations.length === 1 ? "" : "s"} registrada{reservations.length === 1 ? "" : "s"}</Text>

            </View>


            <ReservationFilters

                selectedFilter={
                    selectedFilter
                }

                onChangeFilter={
                    setSelectedFilter
                }

            />


            {

                filteredReservations.length === 0 ? (

                    <Text
                        style={styles.subtitle}
                    >

                        No tienes reservas todavía.

                    </Text>

                ) : (

                    filteredReservations.map(

                        reservation => (

                            <TouchableOpacity

                                key={
                                    reservation.id
                                }

                                activeOpacity={0.8}

                                onPress={() =>
                                    handlePress(
                                        reservation.id
                                    )
                                }

                            >

                                <ReservationCard

                                    reservation={
                                        reservation
                                    }

                                />

                            </TouchableOpacity>

                        )

                    )

                )

            }

        </ScrollView>

    );

}
