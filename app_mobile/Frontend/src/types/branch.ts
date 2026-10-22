/**
 * Entity: Branch.
 *
 * Viene de la API real: rtm-fleet-maintenance expone `GET /branches` y el
 * gateway lo enruta sin cambiar la ruta.
 *
 * El `id` es el que devuelve la API (numerico); `branchMapper` lo normaliza a
 * string para que las comparaciones contra `pickupBranchId` / `returnBranchId`
 * de la reserva sean directas.
 */
// types/branch.ts (o donde vivan tus types)
export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    latitude: number | null;
    longitude: number | null;
}

export interface BranchOption {
    id: string;
    name: string;
}