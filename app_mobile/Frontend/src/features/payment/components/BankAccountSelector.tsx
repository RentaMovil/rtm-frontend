import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import AppCard from "../../../shared/components/AppCard/AppCard";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { usePayment } from "../context/PaymentContext";
import { getActiveBankAccounts } from "../services/paymentService";

import type { BankAccount } from "../../../types";

import { createStyles } from "./BankAccountSelector.styles";

/**
 * Selector de cuenta bancaria de destino.
 *
 * Reemplaza al antiguo `PaymentMethodSelector` (metodos de tarjeta), que no
 * corresponde a este dominio: el pago es transferencia manual y el cliente
 * elige a que cuenta transfiere.
 *
 * Muestra solo cuentas activas (INV-002). El numero de cuenta se muestra
 * completo a proposito: es el dato que el cliente necesita para transferir y
 * el Admin necesita para conciliar.
 */
export default function BankAccountSelector() {

  const { selectedBankAccount, setSelectedBankAccount } = usePayment();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  const { themeName } = useTheme();
  const colors = themes[themeName];
  const styles = createStyles(colors);

  useEffect(() => {
    let cancelled = false;

    getActiveBankAccounts().then((loaded) => {
      if (!cancelled) {
        setAccounts(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Iniciales del banco, para el cuadrado de marca. */
  function initialsOf(name: string): string {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.dot} />

          <Text style={styles.title}>Cuenta de pago</Text>
        </View>

        <Text style={styles.subtitle}>
          Transfiere a una de estas cuentas y sube el comprobante
        </Text>
      </View>

      <View style={styles.accountsContainer}>
        {accounts.map((account) => {
          const selected = selectedBankAccount?.id === account.id;

          return (
            <TouchableOpacity
              key={account.id}
              onPress={() => setSelectedBankAccount(account)}
              style={[
                styles.accountCard,
                selected && styles.selectedAccount,
              ]}
            >
              <View style={styles.accountInfo}>
                <View style={styles.accountTop}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>
                      {initialsOf(account.bankName)}
                    </Text>
                  </View>

                  <View style={styles.radioWrapper}>
                    <Text style={styles.bankName}>{account.bankName}</Text>
                  </View>
                </View>

                <Text style={styles.holder}>{account.holderName}</Text>

                {/*
                  Numero y tipo de cuenta: no existen en el dominio real
                  (rtm-payment-billing.BankAccount solo tiene bankName,
                  accountHolder, qrImageUrl, isActive). El cliente transfiere
                  escaneando el QR de la cuenta, no copiando un numero.
                */}

                {/*
                  El QR es fijo (una imagen por cuenta, no por reserva): no
                  codifica el monto a transferir, solo identifica la cuenta.
                  El cliente ve el total a pagar en esta misma pantalla y lo
                  transfiere aparte, como con cualquier QR bancario real.
                */}
                {account.qrImageUrl && (
                  <View style={styles.qrBox}>
                    <Image
                      source={{ uri: account.qrImageUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>

              <View
                style={[styles.radio, selected && styles.radioSelected]}
              >
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </AppCard>
  );
}
