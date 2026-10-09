import { API_ROUTES } from "../../../config/env";
import { httpClient } from "../../../shared/api/httpClient";
import { fromApiVehicle, fromApiVehiclePage, type FleetVehicleDto, type FleetVehiclePage } from "./vehicleMapper";

import type { Vehicle, VehicleFilters } from "../../../types";

/**
 * Servicio de vehiculos contra rtm-fleet-maintenance (a traves del gateway).
 *
 * El catalogo publico (`GET /vehicles`) pagina y solo trae AVAILABLE; se pide
 * la pagina maxima (100, igual que el web) porque el filtrado sigue haciendose
 * en el cliente sobre el conjunto completo, mismo criterio que usa el web
 * (`carsService.js` deriva sus listas con `new Set(cars.map(...))`).
 */
const PAGE_SIZE = 100;

function matchesSearch(vehicle: Vehicle, query: string): boolean {
  const q = query.toLowerCase();

  return (
    vehicle.plate.toLowerCase().includes(q) ||
    vehicle.brand.toLowerCase().includes(q) ||
    vehicle.model.toLowerCase().includes(q) ||
    vehicle.vehicleType.toLowerCase().includes(q) ||
    vehicle.location.toLowerCase().includes(q)
  );
}

function applyFilters(
  vehicles: Vehicle[],
  filters?: VehicleFilters,
): Vehicle[] {
  if (!filters) {
    return vehicles;
  }

  return vehicles.filter((vehicle) => {
    if (filters.brand && vehicle.brand !== filters.brand) return false;
    if (filters.model && vehicle.model !== filters.model) return false;
    if (filters.vehicleType && vehicle.vehicleType !== filters.vehicleType)
      return false;
    if (filters.fuelType && vehicle.fuelType !== filters.fuelType) return false;
    if (filters.location && vehicle.location !== filters.location) return false;
    if (filters.minPrice !== undefined && vehicle.price < filters.minPrice)
      return false;
    if (filters.maxPrice !== undefined && vehicle.price > filters.maxPrice)
      return false;
    if (filters.minCapacity !== undefined && vehicle.capacity < filters.minCapacity)
      return false;
    if (filters.minYear !== undefined && vehicle.year < filters.minYear)
      return false;
    if (filters.search && !matchesSearch(vehicle, filters.search)) return false;

    return true;
  });
}

export const vehicleService = {
  async getVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
    const page = await httpClient.get<FleetVehiclePage>(
      `${API_ROUTES.vehicles}?limit=${PAGE_SIZE}`,
    );
    const all = fromApiVehiclePage(page);

    return applyFilters(all, filters);
  },

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    const vehicle = await httpClient.get<FleetVehicleDto>(`${API_ROUTES.vehicles}/${id}`);
    return fromApiVehicle(vehicle);
  },

  /**
   * GET /vehicles/{id}/availability?from=&to= (rtm-fleet-maintenance).
   * Revisa el estado del vehiculo Y que no se cruce con otra reserva
   * (reservationOccupancyPort), no solo Vehicle.status. `from`/`to` deben
   * ir como fecha simple (yyyy-MM-dd), sin hora.
   */
  async getAvailability(id: string, from: string, to: string): Promise<boolean> {
    const res = await httpClient.get<{ available: boolean }>(
      `${API_ROUTES.vehicles}/${id}/availability?from=${from}&to=${to}`,
    );
    return res.available;
  },

  /** Marcas disponibles, derivadas del catalogo completo. */
  async getBrands(): Promise<string[]> {
    const all = await this.getVehicles();

    return [...new Set(all.map((v) => v.brand))];
  },

  /** Tipos de vehiculo disponibles. */
  async getVehicleTypes(): Promise<string[]> {
    const all = await this.getVehicles();

    return [...new Set(all.map((v) => v.vehicleType))];
  },

  /** Tipos de combustible disponibles. */
  async getFuelTypes(): Promise<string[]> {
    const all = await this.getVehicles();

    return [...new Set(all.map((v) => v.fuelType))];
  },

  /** Ubicaciones disponibles (la API lo llama `location`). */
  async getLocations(): Promise<string[]> {
    const all = await this.getVehicles();

    return [...new Set(all.map((v) => v.location))];
  },

  /** Rango de precios del catalogo. */
  async getPriceRange(): Promise<{ min: number; max: number }> {
    const all = await this.getVehicles();

    const prices = all.map((v) => v.price);

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  },
};
