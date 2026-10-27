import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { themes } from '../theme/themes';
import { useTheme } from '../theme/useTheme';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  const { themeName } = useTheme();
  const colors = themes[themeName];

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
          }}
        >
          {t('notFound.title')}
        </Text>

        <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
          <Text style={{ fontSize: 14, color: colors.primary }}>
            {t('notFound.goHome')}
          </Text>
        </Link>
      </View>
    </>
  );
}
