import {
  StyleProp,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { createStyles } from "./PasswordField.styles";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  value: string;
  onChange: (value: string) => void;

  /** Se dispara al perder el foco: marca el campo como tocado en la validacion en tiempo real. */
  onBlur?: () => void;

  /** true = el texto esta oculto (secureTextEntry activo). */
  hidden: boolean;
  onToggleVisibility: () => void;

  /**
   * Caja del input: cada pagina compone su propio style
   * (`[styles.input, styles.inputWeb]` en auth, `styles.input` en cuenta).
   * El padding que reserva espacio para el ojo lo pone el componente.
   */
  inputStyle?: StyleProp<TextStyle>;
};

/**
 * Input de contrasena con el ojo de mostrar/ocultar, compartido por
 * LoginPage, RegisterPage y ChangePasswordPage (y candidato a
 * PasswordCodeFlow). El placeholder y las claves de accesibilidad son las
 * mismas en las tres pantallas (`loginForm.*`), asi que viven aqui.
 */
export default function PasswordField({
  value,
  onChange,
  onBlur,
  hidden,
  onToggleVisibility,
  inputStyle,
}: Props) {
  const { t } = useTranslation();

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles();

  return (
    <View style={styles.field}>
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        secureTextEntry={hidden}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={t("loginForm.passwordPlaceholder")}
        placeholderTextColor={colors.secondaryText}
        style={[inputStyle, styles.input]}
      />

      <TouchableOpacity
        style={styles.toggle}
        onPress={onToggleVisibility}
        accessibilityRole="button"
        accessibilityLabel={t(
          hidden ? "loginForm.showPassword" : "loginForm.hidePassword"
        )}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <FontAwesome
          name={hidden ? "eye" : "eye-slash"}
          size={18}
          color={colors.button}
        />
      </TouchableOpacity>
    </View>
  );
}
