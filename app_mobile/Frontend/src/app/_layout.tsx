import { ThemeProvider } from "../theme/themeContext";
import { themes } from "../theme/themes";
import { useTheme } from "../theme/useTheme";

import {
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

import { Stack, useRouter, useSegments } from "expo-router";

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

import { PaymentProvider } from "../features/payment/context/PaymentContext";


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

                <ReservationProvider>

                    <PaymentProvider>

                        <InnerNav />

                    </PaymentProvider>

                </ReservationProvider>

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
     * Tras entrar, el destino es el **menu**, no Inicio: la idea es que el
     * cliente aterrice en su panel, no en la pantalla de buscar vehiculo.
     */
    useEffect(() => {

        if (isLoading) {

            return;

        }

        const inAuthFlow =
            segments[0] === "auth";

        if (isAuthenticated) {

            if (inAuthFlow) {

                router.replace("/menu");

            }

            return;

        }

        if (!inAuthFlow) {

            router.replace("/auth/login");

        }

    }, [
        isLoading,
        isAuthenticated,
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
                     * El logotipo va como `headerTitle` por defecto, no como
                     * `title`. Antes era un string plano ("Renta Móvil"), que
                     * salia en un solo color y ademas con un espacio, mientras
                     * que dentro de las tabs se veia bicolor. Al usar un solo
                     * componente, los colores no pueden divergir entre pantallas.
                     *
                     * Se aplica a todas las pantallas, incluida la de
                     * notificaciones: esa pagina lleva su nombre en el cuerpo
                     * (`NotificationPage`), no en el header.
                     */
                    headerTitle: () => <BrandLogo />,

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

        </NavigationThemeProvider>

    );

}