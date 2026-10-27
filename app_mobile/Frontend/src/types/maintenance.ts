import type { Money, UUID } from "./common";

/**
 * Entity: Maintenance (VehicleMaintenance).
 * Fuente: `web/Front-end/db.json` (coleccion `maintenances`).
 *
 * Es gestion de flota: la consume el Admin, no el cliente. Se tipa para
 * completar el contrato con la API, pero ninguna pantalla de la app
 * cliente deberia mostrarla.
 */
export type Maintenance = {
  id: UUID;
  vehicleId: UUID;
  plate: string;
  brand: string;
  model: string;
  date: string;
  cost: Money;
  maintenanceType: string;
  observations: string;
  image: string;
  status: string;
};
