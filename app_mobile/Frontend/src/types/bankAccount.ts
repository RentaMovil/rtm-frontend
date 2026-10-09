/**
 * Entity: BankAccount.
 *
 * Forma real de rtm-payment-billing (BankAccountResponse): id, bankName,
 * accountHolder (aqui holderName), qrImageUrl, isActive. Ese servicio NO
 * tiene numero ni tipo de cuenta: el cliente transfiere escaneando el QR,
 * no copiando un numero (a diferencia del mock del web, que si los traia).
 *
 * Reemplaza al antiguo concepto `PaymentMethod` (tarjetas): el pago es una
 * transferencia bancaria manual revisada por un Admin, no una pasarela
 * automatica (INV-004 en el dominio del web).
 */
export type BankAccount = {
  id: string;
  /** "Bancolombia", "Nequi", "Davivienda" */
  bankName: string;
  /** Razon social de la empresa. */
  holderName: string;
  /** QR a mostrar en el checkout. `null` cuando no hay imagen. */
  qrImageUrl: string | null;
  /** Las cuentas inactivas se ocultan en el checkout (INV-002). */
  isActive: boolean;
};

/** Cuenta bancaria mostrable en el checkout. */
export type BankAccountOption = {
  id: string;
  bankName: string;
  holderName: string;
  qrImageUrl: string | null;
};
