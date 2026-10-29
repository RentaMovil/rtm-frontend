import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../theme/useTheme";
import { themes } from "../../theme/themes";
import { Fonts } from "../../theme/fonts";
import { useNotifications } from "../../features/notification/context/NotificationContext";
import BrandLogo from "../../shared/components/Brand/BrandLogo";
import { useClientOnlyValue } from "../../shared/hooks/useClientOnlyValue";

type IconName = React.ComponentProps<typeof FontAwesome>["name"];

const styles = {
  headerActions: { flexDirection: "row" as const, alignItems: "center" as const, gap: 18, marginRight: 15 },
  headerAction: { paddingVertical: 4 },
  badge: {
    position: "absolute" as const, top: -4, right: -8, minWidth: 16, height: 16,
    paddingHorizontal: 4, borderRadius: 8, alignItems: "center" as const, justifyContent: "center" as const,
  },
  badgeText: { fontSize: 10, fontWeight: "700" as const },
};

type TabBarIconProps = Readonly<{ name: IconName; color: string }>;

function TabIcon({ name, color }: TabBarIconProps) {
  return <FontAwesome name={name} size={20} color={color} />;
}

function HeaderRightButton() {
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.headerActions}>
      <Link href="/notifications" asChild>
        <Pressable style={styles.headerAction} accessibilityRole="button" accessibilityLabel="Notificaciones">
          {({ pressed }) => (
            <View>
              <FontAwesome name="bell" size={22} color={colors.button} style={{ opacity: pressed ? 0.5 : 1 }} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={[styles.badgeText, { color: colors.backgroundCard }]}>{unreadCount}</Text>
                </View>
              )}
            </View>
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
        tabBarActiveTintColor: colors.secondaryText,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarActiveBackgroundColor: colors.backgroundCard,
        tabBarInactiveBackgroundColor: colors.backgroundCard,
        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.sans.semibold,
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: { paddingVertical: 6, backgroundColor: colors.backgroundCard },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitle: () => null,
        headerLeft: () => <View style={{ marginLeft: 15 }}><BrandLogo order="text-first" /></View>,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "RentaMóvil",
          tabBarLabel: t("tabs.home"),
          tabBarIcon: ({ focused, color }) => <TabIcon name="car" color={focused ? colors.button : color} />,
          headerRight: HeaderRightButton,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: "RentaMóvil",
          tabBarLabel: t("tabs.reservations"),
          tabBarIcon: ({ focused, color }) => <TabIcon name="bookmark" color={focused ? colors.button : color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "RentaMóvil",
          tabBarLabel: t("tabs.account"),
          tabBarIcon: ({ focused, color }) => <TabIcon name="user" color={focused ? colors.button : color} />,
        }}
      />
    </Tabs>
  );
}
