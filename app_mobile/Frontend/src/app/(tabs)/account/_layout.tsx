import { Stack } from "expo-router";

import { useTheme } from "../../../theme/useTheme";
import { themes } from "../../../theme/themes";

import BrandLogo from "../../../shared/components/Brand/BrandLogo";

export default function AccountLayout() {
  const { themeName } = useTheme();
  const colors = themes[themeName];

  return (
    <Stack
      screenOptions={{
        headerTitle: () => null,
        headerLeft: () => (
          <BrandLogo order="text-first" />
        ),
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
