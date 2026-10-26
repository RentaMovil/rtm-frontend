export interface ThemeColors {
  background: string;
  backgroundCard: string;
  card: string;
  text: string;
  /** `--text-h` del web: color de titulos, un punto mas intenso que `text`. */
  textHeading: string;
  secondaryText: string;
  primary: string;
  /** `--primary-dark`: version oscurecida, para texto sobre acento. */
  primaryDark: string;
  border: string;
  /** `--bordercard`: borde de tarjeta, con tinte de marca. */
  cardBorder: string;
  success: string;
  button: string;
  buttonText: string;
  input: string;
  cardBg: string;
  borderfilter: string;
  textBtn: string;
  error: string;
  label: string;
  /** `--accent-bg`: fondo de badges y callouts. */
  accentBg: string;
  /** `--accent-border`: borde de badges y callouts. */
  accentBorder: string;
  /** `--shadow`: color de la sombra de tarjeta. React Native no admite las
   *  dos capas ni el desplazamiento del CSS, asi que se queda el color. */
  shadow: string;
  /** Velo de modales y hojas. No existe en el web: se usa el mismo en los
   *  cuatro temas. */
  overlay: string;
  /** Tinte suave del primario: `--filterContractOpacity` del web. */
  primarySurface: string;
  /** Tinte suave de exito: `--notification` del web. */
  successSurface: string;
  /** Tinte de error. El web solo define `--cancel` en `light`, asi que se
   *  replica ese valor y se deriva el tinte de la misma familia. */
  errorSurface: string;
}

const darkThemeAccents = {
  primary: "#C59B27",
  primaryDark: "#AA820A",
  button: "#C59B27",
  accentBg: "#C59B27",
  accentBorder: "#C59B27",
  shadow: "rgba(0, 0, 0, 0.5)",
  overlay: "rgba(0, 0, 0, 0.6)",
  primarySurface: "rgba(197, 155, 39, 0.15)",
  errorSurface: "rgba(239, 68, 68, 0.14)",
} as const;

/**
 * Paleta de la app.
 *
 * Los cuatro temas se llaman igual que los del web y copian sus valores
 * exactos de `web/Front-end/src/index.css`, token por token:
 *
 *   :root.light      -> light
 *   :root.dark       -> dark
 *   :root.darkPurple -> darkPurple
 *   :root.skylight   -> skylight
 *
 * Antes los temas se llamaban `light`, `dark`, `ocean` y `gray`, y `ocean` y
 * `gray` no tenian contraparte en el web: divergian en 14 tokens y eran
 * azules/gris inventados. Se eliminaron para que ambos clientes muestren
 * exactamente los mismos colores.
 *
 * `shadow` es el unico token que no es una copia literal: el CSS declara dos
 * capas con desplazamiento y desenfoque, y React Native solo admite
 * `shadowColor` + `shadowOffset` + `shadowRadius`, asi que se conserva el
 * color de la primera capa.
 *
 * `overlay`, `errorSurface` y `successSurface` no tienen variable equivalente
 * en el CSS (el web usa `color-mix` y RGBA en el sitio); se derivan de la
 * misma familia de color que sus temas.
 */
export const themes = {
  light: {
    background: "#FAFAFA",
    backgroundCard: "#FFFFFF",
    card: "#FFFFFF",
    text: "#1F2937",
    textHeading: "#111827",
    secondaryText: "#9CA3AF",
    primary: "#00B67A",
    primaryDark: "#009463",
    border: "rgba(0, 182, 122, 0.12)",
    cardBorder: "#A3E2CD",
    success: "#00B67A",
    button: "#F2C063",
    buttonText: "#121212",
    input: "#F3F4F6",
    cardBg: "#FFFFFF",
    borderfilter: "#A3E2CD",
    textBtn: "#121212",
    error: "#EF4444",
    label: "#00B67A",
    accentBg: "#F2C063",
    accentBorder: "#F2C063",
    shadow: "rgba(0, 182, 122, 0.02)",
    overlay: "rgba(0, 0, 0, 0.45)",
    primarySurface: "rgba(0, 182, 122, 0.1)",
    successSurface: "#ECFDF5",
    errorSurface: "#FEF2F2",
  },

  dark: {
    ...darkThemeAccents,
    background: "#121212",
    backgroundCard: "#1C1C1C",
    card: "#1C1C1C",
    text: "#F8FAFC",
    textHeading: "#e8e8e8",
    secondaryText: "#64748B",
    border: "rgba(255, 255, 255, 0.06)",
    cardBorder: "#262626",
    success: "#22C55E",
    buttonText: "#121212",
    input: "#1A1A1A",
    cardBg: "#1C1C1C",
    borderfilter: "#262626",
    textBtn: "#121212",
    error: "#EF4444",
    label: "#FFFFFF",
    successSurface: "#1A1A1A",
  },

  darkPurple: {
    ...darkThemeAccents,
    background: "#030712",
    backgroundCard: "#070F22",
    card: "#070F22",
    text: "#F8FAFC",
    textHeading: "#94A3B8",
    secondaryText: "#475569",
    border: "rgba(255, 255, 255, 0.04)",
    cardBorder: "#111E33",
    success: "#137310",
    buttonText: "#030712",
    input: "#0B1528",
    cardBg: "#070F22",
    borderfilter: "#111E33",
    textBtn: "#030712",
    error: "#EF4444",
    label: "#FFFFFF",
    successSurface: "#0B1528",
  },

  skylight: {
    background: "#F8FAFC",
    backgroundCard: "#FFFFFF",
    card: "#FFFFFF",
    text: "#1F2937",
    textHeading: "#1E3A8A",
    secondaryText: "#64748B",
    primary: "#1E3A8A",
    primaryDark: "#0F172A",
    border: "rgba(30, 58, 138, 0.15)",
    cardBorder: "#E0E7FF",
    success: "#10B981",
    button: "#1E3A8A",
    buttonText: "#FFFFFF",
    input: "#F8FAFC",
    cardBg: "#F8FAFC",
    borderfilter: "#E0E7FF",
    textBtn: "#FFFFFF",
    error: "#EF4444",
    label: "#1E3A8A",
    accentBg: "rgba(30, 58, 138, 0.08)",
    accentBorder: "rgba(30, 58, 138, 0.2)",
    shadow: "rgba(30, 58, 138, 0.08)",
    overlay: "rgba(0, 0, 0, 0.45)",
    primarySurface: "rgba(30, 58, 138, 0.1)",
    successSurface: "#ECFDF5",
    errorSurface: "#FEF2F2",
  },
} satisfies Record<string, ThemeColors>;

export type Themes = keyof typeof themes;
