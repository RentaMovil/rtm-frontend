/**
 * Reglas de la contrasena nueva. Mismas que la web: iam exige minimo 8, una
 * mayuscula y un numero; el caracter especial lo pide el frontend.
 */
export const isPasswordValid = (password: string): boolean =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[#@!$%^&*.-]/.test(password);

export type PasswordRule = { label: string; valid: boolean };

export const buildPasswordRules = (
  password: string,
  t: (key: string) => string,
): PasswordRule[] => [
  { label: t("passwordRecovery.ruleLength"), valid: password.length >= 8 },
  {
    label: t("passwordRecovery.ruleSpecial"),
    valid: /[#@!$%^&*.-]/.test(password),
  },
  { label: t("passwordRecovery.ruleUpper"), valid: /[A-Z]/.test(password) },
  { label: t("passwordRecovery.ruleNumber"), valid: /\d/.test(password) },
];
