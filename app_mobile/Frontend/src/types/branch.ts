/**
 * Entity: Branch.
 *
 * NO esta en la API mock (se resuelve con un mock local de la app) y la
 * forma se toma del frontend web: `web/Front-end/src/shared/mocks/branches.js`.
 *
 * El tipo de dominio del web (`src/types/branch.ts`) usa `branchId`, pero su
 * propio mock usa `id` y el web lo dejo asi a proposito para no romper a sus
 * consumidores. Aqui se replica el mock (`id`), que es lo que estableciste.
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