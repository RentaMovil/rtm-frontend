/**
 * Barrel de tipos de dominio.
 *
 * Espejo de `web/Front-end/src/types/index.ts`. Los nombres coinciden con los
 * del web a proposito: mobile y web son dos clientes del mismo dominio.
 *
 * Tipos con dos caras:
 *  - `common.ts`   primitivas y value objects
 *  - `vehicle.ts`, `branch.ts`, `maintenance.ts`  -> fleet-maintenance
 *    (/vehicles, /branches, /maintenances)
 *  - `user.ts`     -> iam (/users, /auth)
 *  - `reservation.ts`, `insuranceType.ts`, `notification.ts`
 *                   -> booking-reservation (/reservations, /notifications)
 *  - `bankAccount.ts`, `payment.ts` -> payment-billing
 *    (/bank-accounts, /payments)
 *
 * Todos tienen API real: la app habla con el gateway (puerto 8080), que
 * enruta cada prefijo al servicio que le corresponde.
 *
 * Excepcion documentada: `notification.ts` NO es espejo del web. Sigue la
 * forma que sirve la API real, que es la fuente de verdad. Ver el propio
 * archivo para el detalle.
 */

export * from "./common";
export * from "./branch";
export * from "./vehicle";
export * from "./insuranceType";
export * from "./bankAccount";
export * from "./reservation";
export * from "./payment";
export * from "./maintenance";
export * from "./user";
export * from "./notification";
