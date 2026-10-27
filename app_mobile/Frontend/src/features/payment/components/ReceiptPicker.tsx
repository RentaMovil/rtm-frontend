import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";

import AppCard from "../../../shared/components/AppCard/AppCard";
import { appAlert } from "../../../shared/components/Alert/AppAlert";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles } from "./ReceiptPicker.styles";
import type { PaymentReceiptFile } from "../../../types";

/**
 * En web no hay camara: expo-image-picker resuelve `launchCameraAsync`
 * abriendo un `<input type="file">` con `capture`. Es decir, el mismo boton
 * daria "Tomar foto" y abriria un selector de archivos, que no es lo que el
 * usuario espera. Ademas la URI que devuelve en web es un blob URL
 * (`URL.createObjectURL`): sirve para previsualizar, pero es efimera (se
 * revoca al recargar) y no se puede persistir ni enviar a un backend tal
 * cual. Por eso la accion cambia de nombre segun la plataforma.
 */
const IS_WEB = Platform.OS === "web";

type Props = {
  /** Archivo elegido, o null si no hay ninguno. */
  receiptFile: PaymentReceiptFile | null;
  onChange: (file: PaymentReceiptFile | null) => void;
};

/**
 * Selector del comprobante de pago.
 *
 * El dominio lo exige como campo obligatorio de `Payment`
 * (`receiptFileUrl`): sin el, un Admin no tiene nada que revisar. El cliente
 * transfiere por su cuenta y adjunta la imagen del comprobante.
 *
 * La URI local se usa para la vista previa; paymentService sube el archivo
 * antes de enviar el pago y persiste la URL de almacenamiento.
 */
export default function ReceiptPicker({ receiptFile, onChange }: Props) {
  const { t } = useTranslation();
  const [isPicking, setIsPicking] = useState(false);
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  const pickLabel = IS_WEB ? t("receiptPicker.attachImage") : t("receiptPicker.pickCamera");
  const subtitle = IS_WEB ? t("receiptPicker.subtitleWeb") : t("receiptPicker.subtitleNative");

  async function pickFromCamera() {
    // El comprobante suele ser una captura de la app del banco, por eso la
    // camara es la opcion por defecto, pero tambien ya se tenia esa foto.
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      appAlert.alert(t("receiptPicker.cameraPermissionTitle"), t("receiptPicker.cameraPermissionMessage"));
      return null;
    }

    return ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 });
  }

  async function pickFromLibrary() {
    if (!IS_WEB) {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        appAlert.alert(t("receiptPicker.galleryPermissionTitle"), t("receiptPicker.galleryPermissionMessage"));
        return null;
      }
    }

    return ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
  }

  async function runPick(source: "camera" | "library") {
    if (isPicking) {
      return;
    }

    setIsPicking(true);

    try {
      const result = source === "camera" ? await pickFromCamera() : await pickFromLibrary();

      if (result && !result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        onChange({
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
        });
      }
    } catch (error) {
      appAlert.alert(
        source === "camera" ? t("receiptPicker.cameraError") : t("receiptPicker.libraryError"),
        error instanceof Error ? error.message : t("errors.unexpected"),
      );
    } finally {
      setIsPicking(false);
    }
  }

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.dot} />

          <Text style={styles.title}>{t("receiptPicker.title")}</Text>
        </View>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {receiptFile ? (
        <View>
          <Image
            source={{ uri: receiptFile.uri }}
            style={styles.preview}
            resizeMode="contain"
          />

          <View style={styles.actions}>
            {!IS_WEB && (
              <TouchableOpacity style={styles.action} onPress={() => runPick("camera")}>
                <Text style={styles.actionText}>{t("receiptPicker.pickCamera")}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.action} onPress={() => runPick("library")}>
              <Text style={styles.actionText}>{t("receiptPicker.pickGallery")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.action, styles.dangerAction]}
              onPress={() => onChange(null)}
            >
              <Text style={[styles.actionText, styles.dangerText]}>{t("receiptPicker.remove")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isPicking ? (
        <View style={styles.placeholder}>
          <ActivityIndicator color={colors.button} />
        </View>
      ) : IS_WEB ? (
        <TouchableOpacity style={styles.placeholder} onPress={() => runPick("library")}>
          <FontAwesome name="paperclip" size={22} color={colors.button} />

          <Text style={styles.placeholderText}>{pickLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.placeholder, { flex: 1 }]} onPress={() => runPick("camera")}>
            <FontAwesome name="camera" size={22} color={colors.button} />

            <Text style={styles.placeholderText}>{t("receiptPicker.pickCamera")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.placeholder, { flex: 1 }]} onPress={() => runPick("library")}>
            <FontAwesome name="paperclip" size={22} color={colors.button} />

            <Text style={styles.placeholderText}>{t("receiptPicker.pickGallery")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </AppCard>
  );
}
