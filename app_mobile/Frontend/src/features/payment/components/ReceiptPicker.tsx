import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import AppCard from "../../../shared/components/AppCard/AppCard";

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

const PICK_LABEL = IS_WEB ? "Adjuntar imagen" : "Tomar foto";
const SUBTITLE = IS_WEB
  ? "Adjunta la foto o captura del comprobante de la transferencia"
  : "Adjunta la foto del comprobante de la transferencia";

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
  const [isPicking, setIsPicking] = useState(false);
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  async function pick() {
    if (isPicking) {
      return;
    }

    setIsPicking(true);

    try {
      if (!IS_WEB) {
        // En nativo si se necesita permiso de camara. El comprobante suele
        // ser una captura de la app del banco, asi que se abre la camara.
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permiso necesario",
            "Se necesita la camara para adjuntar el comprobante de pago.",
          );
          return;
        }
      }

      const result = IS_WEB
        ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] })
        : await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        onChange({
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
        });
      }
    } catch (error) {
      Alert.alert(
        IS_WEB ? "No se pudo adjuntar la imagen" : "No se pudo abrir la camara",
        error instanceof Error ? error.message : "Error inesperado.",
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

          <Text style={styles.title}>Comprobante de pago</Text>
        </View>

        <Text style={styles.subtitle}>{SUBTITLE}</Text>
      </View>

      {receiptFile ? (
        <View>
          <Image
            source={{ uri: receiptFile.uri }}
            style={styles.preview}
            resizeMode="contain"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={pick}>
              <Text style={styles.actionText}>Cambiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.action, styles.dangerAction]}
              onPress={() => onChange(null)}
            >
              <Text style={[styles.actionText, styles.dangerText]}>Quitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.placeholder}
          onPress={pick}
          disabled={isPicking}
        >
          {isPicking ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <FontAwesome
                name="paperclip"
                size={22}
                color={colors.primary}
              />

              <Text style={styles.placeholderText}>{PICK_LABEL}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </AppCard>
  );
}
