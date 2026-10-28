import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import { InsuranceType } from "../../../types";

import { createStyles } from "./InsuranceDetailModal.styles";

type Props = {
  readonly option: InsuranceType | null;
  readonly onClose: () => void;
};

function formatMoney(value: number): string {
  return value.toLocaleString("es-CO");
}

/** Detalle de un plan de seguro: descripcion, etiqueta y precio. */
export default function InsuranceDetailModal({ option, onClose }: Props) {
  const { t } = useTranslation();
  const { themeName } = useTheme();

  const colors = themes[themeName as keyof typeof themes];
  const styles = createStyles(colors);

  return (
    <Modal
      visible={option !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("insurance.detailTitle")}</Text>

          <Text style={styles.name}>{option?.name ?? ""}</Text>

          {option?.tag ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {t(`insurance.tag.${option.tag}`)}
              </Text>
            </View>
          ) : null}

          <Text style={styles.description}>{option?.description ?? ""}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>{t("insurance.price")}</Text>

            <Text style={styles.value}>
              ${option ? formatMoney(option.price) : ""}
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{t("insurance.close")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
