import type { Branch } from "../../../types";

export function toBranchViewModel(branch: any): Branch {
    return {
        id: String(branch.id),
        name: branch.name,
        address: branch.address,
        city: branch.city,
        phone: branch.phone,
        latitude: branch.latitude ?? null,
        longitude: branch.longitude ?? null,
    };
}