import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles } from "./TermsCheckbox.styles";

type TermsCheckboxProps = {
  checked: boolean;
  onToggle: (value: boolean) => void;
};

/**
 * HU-BOOKING-007: hay que aceptar los terminos antes de confirmar la
 * reserva. rtm-booking-reservation rechaza con 400 si `termsAccepted` no es
 * `true` (CreateReservationRequest), asi que esto no es solo UI: sin
 * marcarla, `createReservation` falla.
 */
export default function TermsCheckbox({ checked, onToggle }: TermsCheckboxProps) {
  const { t } = useTranslation();
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  return (
    <Pressable
      style={styles.row}
      onPress={() => onToggle(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>

      <Text style={styles.label}>{t("reservation.terms.accept")}</Text>
    </Pressable>
  );
}
