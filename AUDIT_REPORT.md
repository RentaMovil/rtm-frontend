# Informe Integral de Evaluación de Calidad de Software (Software Quality Audit)

**Proyecto:** RentaMóvil (Web & Mobile Application)
**Fecha de Evaluación:** Octubre 2026
**Evaluador:** Jules (Senior Software Engineering Agent)
**Alcance de la Auditoría:** Arquitectura, Código Limpio (Clean Code), Seguridad, Control de Errores, Rendimiento e Infraestructura de Pruebas.

---

## 1. Resumen Ejecutivo

El presente informe contiene los resultados de la revisión integral de calidad de software realizada sobre los proyectos **Web** (`web/Front-end`) y **Mobile** (`app_mobile/Frontend`) del repositorio RentaMóvil.

El sistema demuestra una arquitectura modular sólida orientada a características (**Feature-Driven Architecture**), con desacoplamiento entre capa UI, mappers de datos y clientes HTTP. No obstante, existen hallazgos de severidad alta en patrones React (llamadas síncronas a `setState` en `useEffect`, mutación de refs durante render), vulnerabilidades de seguridad en el almacenamiento de tokens de sesión y disparidad en la infraestructura de pruebas automatizadas.

| Dimensión de Calidad | Evaluación Web | Evaluación Mobile | Estado General |
| :--- | :---: | :---: | :---: |
| **Arquitectura y Estructura** | 8.5 / 10 | 9.0 / 10 | 🟢 Bueno |
| **Código Limpio y Mantenibilidad** | 6.0 / 10 | 7.5 / 10 | 🟡 Requiere Atención |
| **Seguridad y Privacidad** | 6.5 / 10 | 8.0 / 10 | 🟡 Requiere Atención |
| **Bugs y Manejo de Errores** | 6.0 / 10 | 8.0 / 10 | 🟡 Requiere Atención |
| **Infraestructura de Pruebas** | 2.0 / 10 | 7.0 / 10 | 🔴 Crítico (Falta Web Unit Testing) |

---

## 2. Evaluación Arquitectónica

### 2.1 Estructura del Proyecto Web (`web/Front-end`)
- **Patrón Modular:** Organizado por dominios de negocio (`features/admin`, `features/auth`, `features/booking`, `features/payment`, `features/vehicles`), lo que promueve una alta cohesión y facilita la navegación en el código.
- **Comunicación HTTP:** Implementa un cliente Axios/Fetch interceptado (`shared/api/httpClient.js`) para manejar autenticación y refresco automático de tokens.
- **Puntos de Mejora:**
  - Acoplamiento ocasional de estado global dentro de componentes de páginas.
  - Código duplicado / componentes no referenciados (ej. `Home.jsx` vs `HomeS.jsx`).

### 2.2 Estructura del Proyecto Mobile (`app_mobile/Frontend`)
- **Tecnología y Enrutamiento:** Desarrollado con Expo SDK 54, React Native 0.81 y Expo Router.
- **Capa de Abstracción:** Excelente definición de tipos TypeScript (`types/`), mappers de entidades (`vehicleMapper.ts`, `insuranceMapper.ts`) y almacenamiento seguro con `SecureStore` + `AsyncStorage`.
- **Estado Global:** Buen uso de Context API (`AuthContext`, `PaymentContext`, `NotificationContext`, `ReservationContext`).

---

## 3. Código Limpio (Clean Code) y Mantenibilidad

### 3.1 Hallazgos en React & React Native
1. **Llamadas síncronas a `setState` dentro de `useEffect` (Web):**
   - Múltiples componentes y hooks (ej. `useCars.js`, `Home.jsx`, `CardsInfo.jsx`, `FiltrerPrice.jsx`, `useUsers.js`) realizan `setState` directo en el cuerpo del efecto, provocando renderizados en cascada (cascading re-renders) que degradan el rendimiento.
2. **Mutación de Refs en Render:**
   - Detectado en `useNotificationStream.js` al asignar `handlersRef.current` directamente durante la fase de renderizado.
3. **Purity / Funciones Impuras:**
   - Invocación de `Date.now()` dentro de bloques memoizados (`useMemo`) en componentes de UI sin listar las dependencias apropiadas.
4. **Desconexión en Dependencias de Hooks:**
   - Múltiples advertencias `react-hooks/exhaustive-deps` al omitir funciones de traducción `t` o valores de ubicación.

### 3.2 Tipado y Mantenibilidad (Mobile)
- Ocurrencias de tipos flexibles (`: any`) en firmas de métodos y contextos de datos, restando efectividad al compilador de TypeScript.

---

## 4. Análisis de Seguridad

1. **Almacenamiento de Tokens de Sesión (Web):**
   - Uso de `localStorage` para almacenar tokens de refresco (`sessionStorage.js`). El almacenamiento web local es vulnerable a ataques de **Cross-Site Scripting (XSS)**. Se recomienda migrar a cookies `HttpOnly` con flag `SameSite=Strict`.
2. **Fuga de Tokens en Query String (Web):**
   - El canal de notificaciones en tiempo real (SSE) en `useNotificationStream.js` envía el token en la URL (`/notifications/stream?token=...`). Esto expone credenciales en logs de proxies, servidores y en el historial.
3. **Hardcoding de URLs de Entorno:**
   - URLs de prueba y fallback local para la API se encuentran estáticas en `env.ts` / `vite.config.js`. Deben provenir estrictamente de variables de entorno administradas.

---

## 5. Análisis de Bugs y Manejo de Errores

1. **Ausencia de Error Boundaries (Web):**
   - La aplicación Web carece de componentes `ErrorBoundary`. Cualquier excepción no capturada durante el renderizado provocará el colapso completo de la SPA ("pantalla en blanco").
2. **Promesas y Manejo de Excepciones:**
   - Captura de errores con bloques `.catch()` vacíos o únicamente impresión por consola (`console.error`), sin proporcionar realimentación interactiva (Toast/Alert) al usuario.

---

## 6. Pruebas e Infraestructura (Testing Infrastructure)

- **Plataforma Mobile:**
  - Configuración activa con Jest y `jest-expo`.
  - Cobertura de pruebas unitarias sobre mappers y almacenamiento de tokens (`httpClient.test.ts`, `tokenStore.test.ts`, `vehicleMapper.test.ts`, `branchMapper.test.ts`, `insuranceMapper.test.ts`).
  - **Estado:** 19/19 pruebas unitarias ejecutadas exitosamente.
- **Plataforma Web:**
  - **Sin suite de pruebas unitarias.** `package.json` no contiene ejecutor de pruebas (Vitest/Jest) ni scripts de test.

---

## 7. Plan de Acción y Matriz de Prioridades

| Prioridad | Remediación Recomendada | Proyecto | Complejidad |
| :--- | :--- | :---: | :---: |
| 🔴 **P0 (Inmediato)** | Configurar Vitest/React Testing Library y añadir pruebas unitarias para flujos críticos en Web. | Web | Media |
| 🔴 **P0 (Inmediato)** | Migrar refresco de tokens a cookies `HttpOnly` en la SPA Web. | Web | Alta |
| 🟡 **P1 (Alta)** | Refactorizar `useEffect` con `setState` síncrono para eliminar cascading re-renders. | Web | Media |
| 🟡 **P1 (Alta)** | Implementar `ErrorBoundary` global para capturar fallos de renderizado en Web. | Web | Baja |
| 🟢 **P2 (Media)** | Reemplazar tipos `: any` restantes en Mobile por interfaces estrictas. | Mobile | Media |
| 🟢 **P2 (Media)** | Depurar componentes obsoletos/no utilizados (`HomeS.jsx`). | Web | Baja |

---

*Informe generado automáticamente como parte del proceso de auditoría de software de RentaMóvil.*
