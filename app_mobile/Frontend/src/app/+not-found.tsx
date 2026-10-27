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
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
          <Text style={{ fontSize: 14, color: colors.primary }}>
            {t('notFound.goHome')}
          </Text>
        </Link>
      </View>
    </>
  );
}
