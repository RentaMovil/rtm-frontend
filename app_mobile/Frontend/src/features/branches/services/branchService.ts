import { httpClient } from "../../../shared/api/httpClient";
import { toBranchViewModel } from "./branchMapper";
import type { Branch, BranchOption } from "../../../types";

const RESOURCE = "/branches";

function normalizeBranchesResponse(response: unknown): unknown[] {
    if (Array.isArray(response)) {
        return response;
    }

    if (response && typeof response === "object") {
        const payload = response as {
            data?: unknown;
            branches?: unknown;
            items?: unknown;
            results?: unknown;
        };

        const candidate =
            payload.data ?? payload.branches ?? payload.items ?? payload.results;

        if (Array.isArray(candidate)) {
            return candidate;
        }
    }

    return [];
}

/**
 * Acceso a las sucursales.
 *
 * Antes se resolvía localmente contra un catálogo mock; ahora viene de la
 * misma API real que usa el frontend web (/branches), para que ambas
 * plataformas vean exactamente las mismas sucursales.
 */
export async function getBranches(): Promise<Branch[]> {
    const response = await httpClient.get<unknown>(RESOURCE);
    return normalizeBranchesResponse(response).map((branch) =>
        toBranchViewModel(branch as Record<string, unknown>),
    );
}

/**
 * Listado ligero para selectores: evita enviar direccion y coordenadas
 * cuando la pantalla solo necesita id y nombre.
 */
export async function getBranchOptions(): Promise<BranchOption[]> {
    const all = await getBranches();
    return all.map((b) => ({ id: b.id, name: b.name }));
}

/**
 * Resuelve una sucursal por id contra la API.
 *
 * Las reservas guardan `pickupBranchId` / `returnBranchId`, nunca el
 * objeto entero. La UI usa esto para pintar el nombre de la sucursal.
 */
export async function getBranchById(id: string): Promise<Branch | null> {
    try {
        const response = await httpClient.get(`${RESOURCE}/${id}`);
        return toBranchViewModel(response);
    } catch {
        return null;
    }
}