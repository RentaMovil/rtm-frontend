import React, { useState } from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import i18n from "../../../translation/i18n";
import { createStyles } from "./SelectLanguage.styles";
import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

const languages = [
  { code: "es", label: "🇨🇴 Español" },
  { code: "en", label: "🇺🇸 English" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "pt", label: "🇧🇷 Português" },
];

export default function SelectLanguage() {
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "es");

  const handleChangeLanguage = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Idioma</Text>
      <View style={styles.selectContainer}>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={handleChangeLanguage}
          style={styles.picker}
          dropdownIconColor={colors.text}
          itemStyle={{ color: colors.text, backgroundColor: colors.card }}
        >
          {languages.map((language) => (
            <Picker.Item
              key={language.code}
              label={language.label}
              value={language.code}
              color={colors.text}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}
