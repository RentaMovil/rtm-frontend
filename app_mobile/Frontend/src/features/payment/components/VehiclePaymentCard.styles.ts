import { StyleSheet } from "react-native";

import { VEHICLE_IMAGE_ASPECT_RATIO } from "../../../config/assets";
import { createTextStyles } from "../../../theme/constants/typography";

export const createStyles = (colors: any) => {

  const text = createTextStyles(colors);

  return StyleSheet.create({
    // Antes: `height: 180` fijo + `resizeMode="cover"` en el `<Image>`. La
    // imagen real es ~2.09:1, asi que esa caja recortaba los lados del
    // auto. Con `aspectRatio` el alto se ajusta a la proporcion real.
    image: {
      width: "100%",
      aspectRatio: VEHICLE_IMAGE_ASPECT_RATIO,
      borderRadius: 16,
      backgroundColor: colors.input,
    },

    content: {
      marginTop: 16,
      gap: 4,
    },

    name: {
      ...text.h3,
      color: colors.textHeading,
    },

    // El precio es el dato que decide, asi que va en la familia de titulo.
    price: {
      ...text.title,
      fontSize: 16,
      color: colors.primary,
    },

    toggleButton: {
      marginTop: 20,
    },

    toggleText: {
      ...text.bodyMedium,
      color: colors.button,
    },

    details: {
      marginTop: 20,
      gap: 16,
    },

    section: {
      gap: 4,
    },

    label: {
      ...text.caption,
    },

    value: {
      ...text.bodyMedium,
      color: colors.text,
    },
  });
};
