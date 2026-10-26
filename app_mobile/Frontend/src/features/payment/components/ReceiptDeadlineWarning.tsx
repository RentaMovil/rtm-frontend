import { useMemo } from "react";
import { Text, View } from "react-native";

import AppCard from "../../../shared/components/AppCard/AppCard";
import { useTheme } from "../../../theme/useTheme";
import { themes } from "../../../theme/themes";

import { createStyles } from "./ReceiptDeadlineWarning.styles";
import { useReservation } from "../../reservation/context/ReservationContext";

type Props = {
  showWarning: boolean;
};

export default function ReceiptDeadlineWarning({ showWarning }: Props) {
  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  // La fecha de creacion vive en la reserva YA creada (respuesta del
  // POST /reservations), no en el borrador de UI: este componente se pinta
  // justo despues de crear la reserva, cuando el borrador no tiene fecha.
  const { createdReservation } = useReservation();

  const deadline = useMemo(() => {
    if (!createdReservation?.createdAt) return null;

    const createdAt = new Date(createdReservation.createdAt);
    const deadlineDate = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    return {
      date: deadlineDate.toLocaleDateString(),
      time: deadlineDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      full: deadlineDate.toLocaleString(),
    };
  }, [createdReservation?.createdAt]);

  if (!showWarning || !deadline) return null;

  return (
    <AppCard>
      <View style={styles.warningContainer}>
        <View style={styles.iconContainer}>
          <View style={styles.icon} />
          <Text style={styles.iconText}>⚠️</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>¡Tiempo limitado!</Text>
          <Text style={styles.message}>
            Debes enviar el comprobante de pago antes del{" "}
            <Text style={styles.deadlineDate}>{deadline.date}</Text> a las{" "}
            <Text style={styles.deadlineTime}>{deadline.time}</Text>.
          </Text>
          <Text style={styles.consequences}>
            Si no lo haces a tiempo, tu pago quedará en revision y podrías
            perder la reserva.
          </Text>
        </View>
      </View>
    </AppCard>
  );
}
