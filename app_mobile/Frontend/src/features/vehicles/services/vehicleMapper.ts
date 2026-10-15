import type { Vehicle } from "../../../types";

/**
 * Forma del vehiculo que entrega rtm-fleet-maintenance (VehicleResponse en
 * fleet-maintenance.yaml). Fleet lo da desnormalizado por catalogo (marca,
 * categoria y motor cuelgan del modelo), a diferencia del mock, que daba
 * `brand`/`model` como texto plano. Este mapper traduce esa forma al tipo
 * `Vehicle` del dominio (espejo del web), que no cambia.
 */
type FleetCatalogItem = {
  id: number;
  name: string;
};

type FleetVehicleModel = {
  id: number;
  name: string;
  brand: FleetCatalogItem;
  category: FleetCatalogItem;
  engineType: FleetCatalogItem;
};

export type FleetVehicleDto = {
  id: number;
  plate: string;
  model: FleetVehicleModel;
  capacity: number;
  year: number;
  imageUrl: string | null;
  status: string;
  mileage: number;
  dailyPrice: number;
  branch: FleetCatalogItem | null;
};

/** `GET /vehicles` pagina siempre (VehiclePageResponse), incluso en el catalogo publico. */
export type FleetVehiclePage = {
  items: FleetVehicleDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function fromApiVehicle(dto: FleetVehicleDto): Vehicle {
  return {
    id: String(dto.id),
    plate: dto.plate,
    brand: dto.model.brand.name,
    model: dto.model.name,
    price: dto.dailyPrice,
    mileage: dto.mileage,
    year: dto.year,
    capacity: dto.capacity,
    vehicleType: dto.model.category.name,
    fuelType: dto.model.engineType.name,
    // La API da branch como catalogo (id + name); el dominio pide el nombre como texto
    // para mostrar, y el id aparte para poder filtrar por sucursal.
    location: dto.branch?.name ?? "",
    branchId: dto.branch ? String(dto.branch.id) : undefined,
    image: dto.imageUrl ?? "",
    status: dto.status,
  };
}

export function fromApiVehiclePage(page: FleetVehiclePage): Vehicle[] {
  return page.items.map(fromApiVehicle);
}
