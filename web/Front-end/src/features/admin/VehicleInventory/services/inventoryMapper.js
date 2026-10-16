// Vehículos sin foto en fleet (image_url es opcional): se muestra una genérica
import carPlaceholder from "../../../../assets/carro.png";
import { VEHICLE_STATUS_LABEL } from "../../registerVehicle/constans/vehicleStatus";

export function toInventoryViewModel(vehicle) {
    return {
        id: vehicle.id,
        placa: vehicle.plate,
        marca: vehicle.brand,
        modelo: vehicle.model,
        año: vehicle.year,
        tipo: vehicle.vehicleType,
        brandId: vehicle.brandId,
        modelId: vehicle.modelId,
        branchId: vehicle.branchId,
        // fleet ya trae el nombre de la sucursal en cada vehículo (fleetVehicleAdapter -> location)
        sucursal: vehicle.location || "Sin sucursal",
        status: vehicle.status,
        estado: VEHICLE_STATUS_LABEL[vehicle.status] || vehicle.status,
        km: vehicle.mileage,
        imagen: vehicle.image || carPlaceholder,
        capacidad: vehicle.capacity,
        precioDiario: vehicle.price,
        combustible: vehicle.fuelType,
    };
}