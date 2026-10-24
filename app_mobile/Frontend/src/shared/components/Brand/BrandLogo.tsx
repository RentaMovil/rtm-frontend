import { Image, Text, View } from "react-native";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

import { createStyles, createAuthStyles } from "./BrandLogo.styles";

type Props = {
  /**
   * `header` es el tamaño del header de navegacion (19px). `auth` es el
   * grande de las pantallas de acceso (26px).
   */
  readonly size?: "header" | "auth";

  /**
   * Orden de icono y texto. `icon-first` (default) es el orden original,
   * usado en `LoginPage`/`RegisterPage`. `text-first` lo usa el header raiz
   * para que, junto al boton de volver, la secuencia quede
   * "volver -> texto -> icono" en vez de "icono -> texto".
   */
  readonly order?: "icon-first" | "text-first";

  /**
   * Oculta el icono de carro, dejando solo el texto "RentaMóvil".
   *
   * Lo usan unicamente `LoginPage`/`RegisterPage`: en esas pantallas el icono
   * sobra junto al resto del branding. El resto de consumidores (header de
   * las tabs, verificacion de email, recuperar contraseña) no pasan esta
   * prop y siguen mostrando el icono como antes.
   */
  readonly showIcon?: boolean;
};

/**
 * `adaptive-icon.png` (1024x1024, fondo transparente) trae el mismo auto
 * visto de frente que `LogoCar.jsx` del web, pero bundleado como raster para
 * el icono de la app. El dibujo solo ocupa esta caja dentro del lienzo
 * (el resto es margen transparente); se recorta por software para que no
 * se vea diminuto al usarlo junto al texto en 19-26px.
 *
 * El proyecto no tiene `react-native-svg`, asi que no se puede recrear el
 * SVG del web 1:1; este es el recurso de marca real mas cercano ya
 * disponible como asset.
 */
const ICON_SOURCE_SIZE = 1024;
const ICON_CONTENT = { x: 255, y: 307, width: 513, height: 418 };

type BrandIconProps = Readonly<{
  size: number;
  color: string;
}>;

/**
 * Recorta y tiñe `adaptive-icon.png` al color de acento del tema.
 *
 * `tintColor` en `Image` reemplaza el color original por `color` usando
 * solo el canal alfa como mascara, igual que hacia `FontAwesome` con `color`
 * antes. Así el icono sigue respondiendo al tema claro/oscuro aunque el PNG
 * en si sea de un solo tono fijo.
 */
function BrandIcon({ size, color }: BrandIconProps) {
  const scale = size / ICON_CONTENT.height;
  const boxWidth = ICON_CONTENT.width * scale;
  const fullSize = ICON_SOURCE_SIZE * scale;

  return (
    <View style={{ width: boxWidth, height: size, overflow: "hidden" }}>
      <Image
        source={require("@/assets/images/adaptive-icon.png")}
        resizeMode="contain"
        style={{
          width: fullSize,
          height: fullSize,
          marginLeft: -ICON_CONTENT.x * scale,
          marginTop: -ICON_CONTENT.y * scale,
          tintColor: color,
        }}
      />
    </View>
  );
}

/**
 * Logotipo: "Renta" en color de texto y "Móvil" en el acento del tema.
 *
 * Copia de `.logo-text` / `.logo-container2` del web (`Navbar.css`), que usa
 * `--textNavabar` para la primera parte y `--accent` para la segunda, con el
 * icono de coche tambien en acento. En el movil el acento es `colors.button`.
 *
 * Vive en `shared/` y en un solo archivo a proposito: antes estaba copiado
 * en el header de las tabs, en `LoginPage` y en `RegisterPage`, y la palabra
 * salia bicolor en unas pantallas y en un solo color en otras (el
 * `title: "Renta Móvil"` del Stack). Al tener un unico componente, los
 * colores no pueden divergir entre pantallas.
 *
 * La marca no se traduce: es el nombre comercial.
 */
export default function BrandLogo({
  size = "header",
  order = "icon-first",
  showIcon = true,
}: Props) {
  const { themeName } = useTheme();
  const colors = themes[themeName];

  const isAuth = size === "auth";
  const styles = isAuth ? createAuthStyles(colors) : createStyles(colors);

  const icon = showIcon ? (
    <BrandIcon size={isAuth ? 26 : 20} color={colors.button} />
  ) : null;

  const text = (
    <Text style={[styles.text, { color: colors.text }]}>
      Renta
      <Text style={{ color: colors.button }}>Móvil</Text>
    </Text>
  );

  return (
    <View style={styles.row}>
      {order === "text-first" ? (
        <>
          {text}
          {icon}
        </>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </View>
  );
}
