# Informe Integral de Evaluación de Calidad de Software (Software Quality Audit)

**Proyecto:** RentaMóvil (Web & Mobile Application)
**Fecha de Evaluación:** Octubre 2026
**Evaluador:** Jules (Senior Software Engineering Agent)
**Alcance de la Auditoría:** Arquitectura, Código Limpio (Clean Code), Seguridad, Control de Errores, Rendimiento y Pruebas.

---

## 1. Resumen Ejecutivo

El presente informe expone los resultados de la auditoría integral de calidad realizada sobre las plataformas **Web** (`web/Front-end`) y **Mobile** (`app_mobile/Frontend`) del ecosistema RentaMóvil.

En general, el proyecto exhibe una arquitectura modular bien delimitada por características (**Feature-Driven Architecture**), desacoplamiento aceptable mediante mapeadores y servicios de datos, e integración i18n multilenguaje. Sin embargo, se han identificado hallazgos críticos de calidad de código, riesgos de seguridad en el manejo de tokens/sesión y fallas en patrones React (efectos secundarios y manipulación de refs durante render).

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
- **Patrón Modular:** La aplicación adopta una arquitectura basada en características (`features/admin`, `features/auth`, `features/booking`, `features/payment`, `features/vehicles`), promoviendo la cohesión alta.
- **Servicios e Interceptores HTTP:** Posee una capa de comunicación HTTP centralizada (`src/shared/api/httpClient.js`) con refresco automático de tokens.
- **Puntos de Mejora Arquitectónica:**
  - Mezca de responsabilidades en componentes UI (componentes de páginas gestionan estado global, filtrado y lógica de negocio simultáneamente).
  - Presencia de scripts duplicados / componentes obsoletos (ej. `Home.jsx` vs `HomeS.jsx`).

### 2.2 Estructura del Proyecto Mobile (`app_mobile/Frontend`)
- **Tecnología y Enrutamiento:** Construido sobre Expo SDK 54, React Native 0.81 y Expo Router.
- **Separación de Capas:** Excelente tipado TypeScript (`types/`), servicios de mapeo (`vehicleMapper.ts`, `insuranceMapper.ts`), y abstracción de almacenamiento tokenStore (`tokenStore.ts`) combinando `SecureStore` y `AsyncStorage`.
- **Patrones de Diseño:** Correcto uso de Context API para autenticación, pagos, notificaciones y reservas.

---

## 3. Código Limpio (Clean Code) y Mantenibilidad

### 3.1 Hallazgos en React & React Native
1. **Llamadas síncronas a `setState` dentro de `useEffect` (Web):**
   - Múltiples hooks y páginas (ej. `useCars.js`, `Home.jsx`, `BankAccounts.jsx`, `useUsers.js`, `useVehicles.js`) invocan `setState` de forma síncrona dentro del cuerpo de `useEffect`, provocando renderizados en cascada (cascading re-renders) y ralentización de la UI.
2. **Mutación de Refs durante el Renderizado (Web):**
   - En `useNotificationStream.js` se modificaba `handlersRef.current` directamente en el cuerpo del render (corregido durante la intervención para ejecutarse dentro de un `useEffect`).
3. **Funciones Impuras en Render (Web):**
   - En `HistoryReservationDetail.jsx` se realizaba cálculo temporal `Date.now()` dentro de `useMemo` sin dependencias completas (corregido).
4. **Dependencias de Hooks (Web & Mobile):**
   - Abundantes advertencias `react-hooks/exhaustive-deps` por omitir dependencias (ej. `t` de i18n, `location.pathname`, `today`).

### 3.2 Tipado y TypeScript (Mobile)
- Uso persistente de `: any` en firmas de métodos o contextos de datos en el cliente móvil, disminuyendo los beneficios del compilador TypeScript y ocultando errores en tiempo de ejecución.

---

## 4. Análisis de Seguridad

1. **Almacenamiento de Tokens de Sesión (Web):**
   - El `refreshToken` se almacena en `localStorage` (`sessionStorage.js` y `httpClient.js`). `localStorage` es susceptible a ataques **XSS (Cross-Site Scripting)**. Se recomienda migrar el refresco a cookies `HttpOnly` + `SameSite=Strict`.
2. **Canal de Notificaciones SSE (Web):**
   - En `useNotificationStream.js`, el token de acceso se envía a través de parámetros URL query string (`/notifications/stream?token=...`). Los parámetros URL quedan expuestos en logs de servidores web, proxies e historial del navegador.
3. **Manejo de Secretos y Configuración de Entornos:**
   - La URL del gateway en desarrollo y fallback local de endpoints API están expuestos en duro en el código cliente (`env.ts` / `vite.config.js`). Aunque aceptable para desarrollo local, debe ser controlado estrictamente por variables de entorno `.env` en producción.
4. **Sanitización de Archivos y Carga de Recibos:**
   - Carga de imágenes para comprobantes de pago carece de validación de firma mágica (magic bytes) en el cliente Web antes de subir al backend.

---

## 5. Análisis de Bugs y Manejo de Errores

1. **Falta de Error Boundaries (Web):**
   - La aplicación Web carece de componentes `ErrorBoundary` a nivel global o por ruta. Si un componente lanza un fallo no capturado durante el renderizado, toda la pantalla se torna en blanco (White Screen of Death).
2. **Promesas Desatendidas y Manejo de Excepciones:**
   - En varias llamadas a API (`fetchVehicle`, `filterAvailableVehicles`), los errores se capturan con `.catch()` vacíos o se imprimen a `console.error` sin notificar al usuario final con un mensaje interactivo o notificación toast.
3. **Incompatibilidad de Librerías:**
   - Identificado en `MaintenanceForm.jsx` violación `react-hooks/incompatible-library` por llamadas a librerías de formularios incompatibles.

---

## 6. Pruebas y Cobertura (Testing Infrastructure)

- **Plataforma Mobile:**
  - Cuenta con Jest + `jest-expo` configurado.
  - Cobertura existente en utilidades y mapeadores (`httpClient.test.ts`, `tokenStore.test.ts`, `vehicleMapper.test.ts`, `branchMapper.test.ts`, `insuranceMapper.test.ts`).
  - **Resultado de la Suite:** 5/5 Test Suites pasadas (19/19 unit tests ok).
- **Plataforma Web:**
  - **Ausencia total de suite de pruebas unitarias/integración.** El proyecto Web no posee un runner de pruebas (Vitest/Jest) ni scripts de test configurados en `package.json`.

---

## 7. Plan de Acción y Priorización de Remediación

| Prioridad | Acción Recomendada | Proyecto | Complejidad |
| :--- | :--- | :---: | :---: |
| 🔴 **P0 (Inmediato)** | Configurar Vitest/React Testing Library y escribir pruebas para flujos críticos de auth y reserva. | Web | Media |
| 🔴 **P0 (Inmediato)** | Migrar almacenamiento de refresh tokens a cookies `HttpOnly` en Web. | Web | Alta |
| 🟡 **P1 (Alta)** | Refactorizar `useEffect` que provocan llamadas síncronas a `setState` para evitar cascading renders. | Web | Media |
| 🟡 **P1 (Alta)** | Implementar `ErrorBoundary` global y por ruta en la SPA Web. | Web | Baja |
| 🟢 **P2 (Media)** | Reemplazar tipos `: any` restantes en el proyecto Mobile por interfaces TypeScript estrictas. | Mobile | Media |
| 🟢 **P2 (Media)** | Eliminar código redundante (`HomeS.jsx`) y limpiar imports no utilizados. | Web | Baja |

---

*Informe generado automáticamente como parte del proceso de auditoría de software de RentaMóvil.*
