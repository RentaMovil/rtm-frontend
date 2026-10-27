import { ThemeProvider } from "../theme/themeContext";
import { themes } from "../theme/themes";
import { useTheme } from "../theme/useTheme";

import {
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

import { Stack, useRouter, useSegments } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { TouchableOpacity, View } from "react-native";

import BrandLogo from "../shared/components/Brand/BrandLogo";

import * as SplashScreen from "expo-splash-screen";

import { useFonts } from "expo-font";

import {
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";

import { useEffect } from "react";

import "react-native-reanimated";

import { ReservationProvider } from "../features/reservation/context/ReservationContext";

import "../translation/i18n";

import { AuthProvider, useAuth } from "../features/auth/context/AuthContext";

import { NotificationProvider } from "../features/notification/context/NotificationContext";

import { PushNotificationProvider } from "../shared/push/PushNotificationProvider";

import { PaymentProvider } from "../features/payment/context/PaymentContext";

import UpdateBanner from "../shared/components/UpdateBanner/UpdateBanner";

import AppAlertHost from "../shared/components/Alert/AppAlert";


export { ErrorBoundary } from "expo-router";


SplashScreen.preventAutoHideAsync();


export default function RootLayout() {

    // Inter para cuerpo y Poppins para titulos, segun `index.css` del web.
    // El splash no se oculta hasta que las fuentes estan listas: si no, el
    // primer render usa la del sistema y al cargar saltan los textos.
    const [fontsLoaded] = useFonts({

        Poppins_500Medium,

        Poppins_600SemiBold,

        Poppins_700Bold,

        Inter_400Regular,

        Inter_500Medium,

        Inter_600SemiBold,

        Inter_700Bold,

    });

    useEffect(() => {

        if (fontsLoaded) {

            SplashScreen.hideAsync();

        }

    }, [fontsLoaded]);


    if (!fontsLoaded) {

        return null;

    }

    return (

        <ThemeProvider>

            <AuthProvider>

                <NotificationProvider>

                <PushNotificationProvider>
                <ReservationProvider>

                    <PaymentProvider>

                        <InnerNav />

                    </PaymentProvider>

                </ReservationProvider>
                </PushNotificationProvider>

                </NotificationProvider>

            </AuthProvider>

        </ThemeProvider>

    );

}


function InnerNav() {

    const router = useRouter();

    const segments = useSegments();


    const {
        isAuthenticated,
        isLoading,
    } = useAuth();


    const {
        themeName,
    } = useTheme();


    const currentTheme =
        themes[themeName];


    const navigationTheme = {

        ...DefaultTheme,

        colors: {

            ...DefaultTheme.colors,

            background:
                currentTheme.background,

            card:
                currentTheme.card,

            text:
                currentTheme.text,

            border:
                currentTheme.border,

            primary:
                currentTheme.primary,

        },

    };


    /**
     * Guard de sesion.
     *
     * Solo redirige cuando la ruta actual NO coincide con el estado de
     * sesion. Antes el efecto hacia `replace` incondicional en cada montaje,
     * asi que refrescar en `/account` (o en `/payment`) te botaba al home y
     * se comia la navegacion real.
     *
     * Tras entrar, el destino es Inicio para que el cliente pueda buscar
     * vehiculos desde la pantalla principal.
     */
    useEffect(() => {

        if (isLoading) {

            return;

        }

        const inAuthFlow =
            segments[0] === "auth";

        if (isAuthenticated) {

            if (inAuthFlow) {

                router.replace("/");

            }

            return;

        }

        if (!inAuthFlow) {

            router.replace("/auth/login");

        }

    }, [
        isLoading,
        isAuthenticated,
        router,
        segments,
    ]);


    if (isLoading) {

        return null;

    }


    return (

        <NavigationThemeProvider
            value={navigationTheme}
        >

            <Stack

                screenOptions={{

                    /**
                     * El logotipo y el boton de volver van juntos en
                     * `headerLeft`, pegados al extremo izquierdo: back ->
                     * texto "RentaMovil" -> icono del carro (orden pedido,
                     * nada al centro ni a la derecha).
                     *
                     * `headerTitle` queda vacio a proposito (sin el nombre de
                     * la ruta de respaldo). Al sobreescribir `headerLeft`
                     * React Navigation deja de poner el boton nativo de
                     * "volver" automaticamente, asi que se reconstruye aqui
                     * a mano con `canGoBack` (mismo criterio que usa la
                     * libreria: solo se muestra si hay una pantalla previa en
                     * el stack) y `router.back()` de expo-router.
                     *
                     * Se aplica a todas las pantallas, incluida la de
                     * notificaciones: esa pagina lleva su nombre en el cuerpo
                     * (`NotificationPage`), no en el header.
                     */
                    headerTitle: () => null,

                    headerLeft: ({ canGoBack, tintColor }) => (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            {canGoBack && (
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    accessibilityRole="button"
                                    accessibilityLabel="Volver"
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons
                                        name="chevron-back"
                                        size={24}
                                        color={tintColor ?? currentTheme.text}
                                    />
                                </TouchableOpacity>
                            )}

                            <BrandLogo order="text-first" />
                        </View>
                    ),

                    headerStyle: {

                        backgroundColor:
                            currentTheme.background,

                    },

                    headerTintColor:
                        currentTheme.text,

                }}

            >

                <Stack.Screen

                    name="auth/login"

                    options={{

                        headerShown: false,

                    }}

                />


                <Stack.Screen

                    name="auth/register"

                    options={{

                        headerShown: false,

                    }}

                />


                <Stack.Screen

                    name="auth/forgot-password"

                    options={{

                        headerShown: false,

                    }}

                />


                <Stack.Screen

                    name="(tabs)"

                    options={{
                        headerShown: false,
                    }}

                />


                {/*
                 * No hace falta declarar `notifications` aqui. Su titulo va
                 * en el cuerpo de la pagina (`NotificationPage`), y el header
                 * lo pone el `headerTitle` de `screenOptions`. Ademas,
                 * declararlo sin `options` hacia que el validador de
                 * expo-router avisara de que no encuentra la ruta.
                 */}


            </Stack>

            <UpdateBanner />

            <AppAlertHost />

        </NavigationThemeProvider>

    );

}
