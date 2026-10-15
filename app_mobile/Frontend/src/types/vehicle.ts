import type { ISODateTime, Money, UUID } from "./common";

/**
 * Entity: Vehicle.
 * Fuente: `web/Front-end/db.json` (coleccion `vehicles`).
 *
 * La API entrega el vehiculo **desnormalizado**: `brand` y `model` vienen
 * como texto, no como FKs a un catalogo. Eso es lo que se replica aqui.
 *
 * NOTA: `status` llega como texto libre en espanol ("Disponible",
 * "En mantenimiento"). No se tipa como union a proposito: la API no lo
 * garantiza y un enum rigido romperia en cuanto aparezca un valor nuevo.
 */
export type Vehicle = {
  id: UUID;
  /** Placa unica del vehiculo. */
  plate: string;
  brand: string;
  model: string;
  /** Precio por dia. */
  price: Money;
  /** Kilometraje actual. */
  mileage: number;
  year: number;
  /** Capacidad de pasajeros. */
  capacity: number;
  vehicleType: string;
  fuelType: string;
  /** Ubicacion actual (nombre de la sucursal). */
  location: string;
  /** FK Branch. La API real si la expone (a diferencia del mock). */
  branchId?: string;
  image: string;
  status: string;
};

/** Vehiculo con la disponibilidad calculada para un rango de fechas. */
export type VehicleAvailability = {
  vehicle: Vehicle;
  available: boolean;
};

/** Criterios de busqueda de vehiculos. Todos opcionales. */
export type VehicleFilters = {
  brand?: string;
  model?: string;
  vehicleType?: string;
  fuelType?: string;
  location?: string;
  minPrice?: Money;
  maxPrice?: Money;
  minCapacity?: number;
  minYear?: number;
  search?: string;
};
