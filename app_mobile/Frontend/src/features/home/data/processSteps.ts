import type { ComponentProps } from "react";
import type FontAwesome from "@expo/vector-icons/FontAwesome";

type IconName = ComponentProps<typeof FontAwesome>["name"];

/**
 * Los 4 pasos del proceso de alquiler.
 *
 * Contenido editorial estatico del home: no viene de la API ni de un mock.
 * Antes vivia en `features/home/mocks/` y era un espejo de
 * `web/Front-end/src/features/vehicles/data/mocks/stepsMocks.js`, archivo que
 * ya no existe en el repo web. Se movio aqui para que "mocks" siga
 * significando "datos falsos" y no contenido de la pantalla.
 *
 * Alli cada paso traia un componente de icono imported de `react-icons/fa6`
 * (Fa1, Fa2, Fa3, Fa4, que son los numeros dibujados). Aqui se usan
 * iconos con nombre de FontAwesome, que es la unica libreria de iconos que
 * tiene la app.
 *
 * Los textos NO estan aqui: van por clave de i18n, como el resto del
 * proyecto, para que existan en los cuatro idiomas.
 */
export type ProcessStep = {
  id: number;
  titleKey: string;
  descriptionKey: string;
  icon: IconName;
};

export const processSteps: ProcessStep[] = [
  {
    id: 1,
    titleKey: "process.steps.search.title",
    descriptionKey: "process.steps.search.description",
    icon: "search",
  },
  {
    id: 2,
    titleKey: "process.steps.reserve.title",
    descriptionKey: "process.steps.reserve.description",
    // `calendar-check` y `clipboard-check` son de FA6 o PRO: no existen en
    // el set libre de FA5. `tasks` es lo mas cercano a "revisa y confirma".
    icon: "tasks",
  },
  {
    id: 3,
    titleKey: "process.steps.pickup.title",
    descriptionKey: "process.steps.pickup.description",
    icon: "key",
  },
  {
    id: 4,
    titleKey: "process.steps.return.title",
    descriptionKey: "process.steps.return.description",
    icon: "undo",
  },
];
