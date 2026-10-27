import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { appAlert } from "../../../shared/components/Alert/AppAlert";

import {
    useEffect,
    useState,
} from "react";

import { useTranslation } from "react-i18next";

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

    const { t } = useTranslation();

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

                console.error(
                    "Error cargando reservas:",
                    error
                );

                appAlert.alert(
                    t("historyReservation.loadErrorTitle"),
                    t("historyReservation.loadErrorMessage"),
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

                    {t("historyReservation.loadingText")}

                </Text>

            </View>

        );

    }


    return (

        <ScrollView contentContainerStyle={styles.screen}>

            <View
                style={styles.container}
            >

                <Text style={styles.eyebrow}>{t("historyReservation.activityTitle")}</Text>
                <Text style={styles.title}>{t("historyReservation.myReservationsLabel")}</Text>
                <Text style={styles.subtitle}>{t("historyReservation.subtitle")}</Text>
                <Text style={styles.count}>{reservations.length} {t("historyReservation.myReservationsLabel")}{reservations.length === 1 ? "" : "s"} registrada{reservations.length === 1 ? "" : "s"}</Text>

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

                        {t("historyReservation.emptyState")}

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
