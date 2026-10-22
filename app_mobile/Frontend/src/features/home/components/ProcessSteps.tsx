import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { processSteps } from "../data/processSteps";

import { createStyles } from "./ProcessSteps.styles";

/**
 * Los 4 pasos para alquilar un vehiculo, en carrusel.
 *
 * El web los muestra como rejilla estatica de 4 tarjetas en el home
 * (`features/vehicles/components/CardsInfo.jsx`), visible solo antes de
 * buscar. Aqui es un carrusel: el cliente avanza deslizando.
 *
 * Implementado con `FlatList` y `pagingEnabled`, sin librerias externas.
 * El ancho de slide se mide con `onLayout` en vez de asumir el ancho de
 * pantalla, porque el carrusel vive dentro de un contenedor con padding y
 * en web el ancho depende del viewport.
 */
export default function ProcessSteps() {
  const { t } = useTranslation();

  const { themeName } = useTheme();
  const colors = themes[themeName as keyof typeof themes];
  const styles = createStyles(colors);

  const [slideWidth, setSlideWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * El indice sale de `onMomentumScrollEnd`, no de `onViewableItemsChanged`.
   *
   * Con `pagingEnabled` el slide siempre queda entero en pantalla al soltar,
   * asi que el offset dividido entre el ancho da el indice exacto. Ademas
   * evita el error "Changing onViewableItemsChanged on the fly is not
   * supported", que lanza React Native cuando el callback o su
   * `viewabilityConfig` cambian de identidad entre renders.
   */
  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    if (slideWidth <= 0) {
      return;
    }

    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);

    if (index >= 0 && index < processSteps.length) {
      setActiveIndex(index);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("process.title")}</Text>

      <Text style={styles.subtitle}>{t("process.subtitle")}</Text>

      <FlatList
        data={processSteps}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
        onLayout={(event) => setSlideWidth(event.nativeEvent.layout.width)}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: slideWidth || undefined }]}>
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{item.id}</Text>
                </View>

                <Text style={styles.stepTitle}>{t(item.titleKey)}</Text>
              </View>

              <View style={styles.stepIcon}>
                <FontAwesome
                  name={item.icon}
                  size={24}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.stepDescription}>
                {t(item.descriptionKey)}
              </Text>
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {processSteps.map((step, index) => (
          <View
            key={step.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}
