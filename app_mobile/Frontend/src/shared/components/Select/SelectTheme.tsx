import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { themes, type Themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import { createStyles } from "./SelectTheme.styles";

export default function ThemeSelector() {
  const { t } = useTranslation();
  const { themeName, setTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<Themes | null>(null);
  const styles = createStyles(themes[themeName]);

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setVisible(true)} accessibilityRole="button">
        <Text style={styles.triggerLabel}>Tema</Text>
        <View style={styles.triggerValue}>
          <View style={[styles.triggerSwatch, { backgroundColor: themes[themeName].primary }]} />
          <Text style={styles.triggerText}>{t(`themes.${themeName}`)}</Text>
        </View>
      </Pressable>
      <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.container} onPress={() => {}}>
            <Text style={styles.title}>{t("count.seleccionaTema")}</Text>
            <ScrollView contentContainerStyle={styles.grid}>
              {(Object.keys(themes) as Themes[]).map((key) => {
                const active = key === themeName;
                const hovered = key === hoveredTheme;
                return (
                  <Pressable
                    key={key}
                    style={[styles.card, active && styles.cardActive, hovered && styles.cardHovered]}
                    onHoverIn={() => setHoveredTheme(key)}
                    onHoverOut={() => setHoveredTheme(null)}
                    onFocus={() => setHoveredTheme(key)}
                    onBlur={() => setHoveredTheme(null)}
                    onPress={() => { setTheme(key); setVisible(false); }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <View style={[styles.swatch, { backgroundColor: themes[key].primary }]}>
                      {active ? <View style={styles.swatchCheck}><Text style={styles.swatchCheckText}>✓</Text></View> : null}
                    </View>
                    <Text style={[styles.cardLabel, (active || hovered) && styles.cardLabelActive]}>{t(`themes.${key}`)}</Text>
                    <Text style={[styles.cardKey, (active || hovered) && styles.cardKeyActive]}>{key}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>{t("notifications.close")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
