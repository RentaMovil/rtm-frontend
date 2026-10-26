import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { httpClient } from "../api/httpClient";

/**
 * Pide permiso y obtiene el Expo Push Token del dispositivo, y lo manda al backend
 * (POST /users/me/push-token en iam) para que pueda usarlo a la hora de enviar un push.
 *
 * No hace nada en web/emulador (expo-notifications no funciona en web, y los emuladores
 * sin Google Play Services no tienen token real) ni si el usuario niega el permiso.
 */
export async function registerForPushNotificationsAsync(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  if (!Device.isDevice) {
    // Emulador/simulador: no hay token real de push.
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return;
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

  try {
    await httpClient.post("/users/me/push-token", {
      token: expoPushToken,
      platform: Platform.OS,
    });
  } catch {
    // Si falla (red, backend caido), simplemente no queda registrado este dispositivo
    // todavia; se reintenta solo la proxima vez que la app arranque con sesion activa.
  }
}
