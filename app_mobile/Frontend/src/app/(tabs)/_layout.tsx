import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../theme/useTheme";
import { themes } from "../../theme/themes";
import { Fonts } from "../../theme/fonts";
import { Radius } from "../../theme/constants/radius";

import { useNotifications } from "../../features/notification/context/NotificationContext";

import BrandLogo from "../../shared/components/Brand/BrandLogo";
import { useClientOnlyValue } from "../../shared/hooks/useClientOnlyValue";

type IconName = React.ComponentProps<typeof FontAwesome>["name"];

/**
 * `styles` es estatico a proposito: no depende del tema, asi que se declara
 * una sola vez a nivel de modulo. Los colores se aplican en el JSX con
 * `colors.x`, como en el resto de la app.
 */
const styles = {

  headerActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 18,
    marginRight: 15,
  },

  headerAction: {
    paddingVertical: 4,
  },

  badge: {
    position: "absolute" as const,
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },

  /** Contenedor de la pastilla del icono activo. */
  tabIconWrap: {
    width: 46,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};

/**
 * El logotipo se define una sola vez en
 * `shared/components/Brand/BrandLogo.tsx` y lo usan las tres tabs, el Stack
 * raiz, el login y el registro. Antes cada uno tenia su copia y la palabra
 * salia con colores distintos segun la pantalla.
 */
type TabBarIconProps = Readonly<{
  name: IconName;
  focused: boolean;
  color: string;
}>;

/**
 * Icono de tab con pastilla de fondo cuando esta activa.
 *
 * Se resuelve con `tabBarIcon` en vez de un `tabBar` a medida: el componente
 * ya recibe `focused`, y pintar el fondo avoids reimplementar la navegacion
 * por tabs completa.
 */
function TabIcon({ name, focused, color }: TabBarIconProps) {
  const { themeName } = useTheme();
  const colors = themes[themeName];

  return (
    <View
      style={[
        styles.tabIconWrap,
        focused && { backgroundColor: colors.accentBg },
      ]}
    >
      <FontAwesome
        name={name}
        size={19}
        color={color}
      />
    </View>
  );
}

function HeaderRightButton() {
  const { themeName } = useTheme();
  const colors = themes[themeName];

  // El contador vive en NotificationContext, montado por encima de las tabs,
  // asi que la campana puede leerlo sin que la lista se cargue otra vez.
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.headerActions}>
      <Link href="/notifications" asChild>
        <Pressable style={styles.headerAction}>
          {({ pressed }) => (
            <View>
              <FontAwesome
                name="bell"
                size={22}
                color={colors.button}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />

              {unreadCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.error }]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: colors.backgroundCard },
                    ]}
                  >
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Pressable>
      </Link>

      <Link href="/account" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome
              name="user"
              size={25}
              color={colors.button}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  const { themeName } = useTheme();
  const colors = themes[themeName];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.button,
        tabBarInactiveTintColor: colors.secondaryText,

        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },

        /**
         * Solo la tipografia, sin `color`.
         *
         * `text.overline` trae `color: colors.secondaryText`, y extenderlo
         * aqui pisaba `tabBarActiveTintColor`/`tabBarInactiveTintColor`: la
         * etiqueta activa se quedaba gris igual que las otras.
         */
        tabBarLabelStyle: {
          fontFamily: Fonts.sans.semibold,
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 6,
        },

        headerStyle: {
          backgroundColor: colors.background,
        },

        headerTintColor: colors.text,

        /**
         * Igual que en el Stack raiz: `headerTitle` queda vacio y la marca se
         * pinta en `headerLeft` para que quede pegada al extremo izquierdo
         * (texto "RentaMovil" -> icono) en vez de centrada por el
         * comportamiento default de `headerTitle`. Estas tres pantallas son
         * raiz de cada tab, asi que no llevan boton de volver.
         */
        headerTitle: () => null,
        headerLeft: () => (
          <View style={{ marginLeft: 15 }}>
            <BrandLogo order="text-first" />
          </View>
        ),

        // El header solo se ve en web; en nativo se oculta y no hace falta.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "RentaMóvil",
          tabBarLabel: t("tabs.home"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="car" focused={focused} color={color} />
          ),
          headerRight: HeaderRightButton,
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "RentaMóvil",
          tabBarLabel: t("tabs.menu"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="bars" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reservations"
        options={{
          title: "RentaMóvil",
          tabBarLabel: t("tabs.reservations"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="bookmark" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
