import { httpClient, type HttpRequestOptions } from "../../../shared/api/httpClient";
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
 * Catalogo de sucursales en memoria.
 *
 * `GET /branches/{id}` no existe en fleet-maintenance: su `BranchController`
 * solo expone el listado (`@GetMapping`), el alta, la modificacion y el
 * borrado. Para resolver una sucursal por id hay que traer el catalogo y
 * buscar dentro.
 *
 * Se cachea para no repetir la misma peticion: el detalle de una reserva
 * pide dos sucursales (recogida y devolucion) y el home ya habia cargado el
 * listado. La cache se llena sola cada vez que se llama a `getBranches()`.
 */
let branchesCache: Branch[] | null = null;

/** Peticion en vuelo, para que dos ids pedidos a la vez no disparen dos listados. */
let branchesRequest: Promise<Branch[]> | null = null;

async function fetchBranches(options?: HttpRequestOptions): Promise<Branch[]> {
    const response = await httpClient.get<unknown>(RESOURCE, options);

    return normalizeBranchesResponse(response).map((branch) =>
        toBranchViewModel(branch as Record<string, unknown>),
    );
}

/**
 * Trae el catalogo una sola vez y lo cachea.
 *
 * Si la peticion falla no se cachea nada: el siguiente intento reintenta.
 */
function loadBranchesOnce(): Promise<Branch[]> {
    branchesRequest ??= fetchBranches()
        .then((branches) => {
            branchesCache = branches;
            return branches;
        })
        .catch((error) => {
            branchesRequest = null;
            throw error;
        });

    return branchesRequest;
}

/**
 * Acceso a las sucursales.
 *
 * Antes se resolvía localmente contra un catálogo mock; ahora viene de la
 * misma API real que usa el frontend web (/branches), para que ambas
 * plataformas vean exactamente las mismas sucursales.
 */
export async function getBranches(options?: HttpRequestOptions): Promise<Branch[]> {
    const branches = await fetchBranches(options);
    branchesCache = branches;

    return branches;
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
 * Resuelve una sucursal por id.
 *
 * Las reservas guardan `pickupBranchId` / `returnBranchId`, nunca el
 * objeto entero. La UI usa esto para pintar el nombre de la sucursal.
 *
 * El backend no tiene `GET /branches/{id}` (devuelve 405), asi que se resuelve
 * contra el catalogo: se busca la sucursal con ese id. Si no existe o el
 * catalogo no se puede traer, se devuelve `null` y la pantalla lo muestra
 * como desconocido, sin inventar datos.
 */
export async function getBranchById(id: string): Promise<Branch | null> {
    try {
        const branches = branchesCache ?? (await loadBranchesOnce());
        return branches.find((branch) => branch.id === String(id)) ?? null;
    } catch {
        return null;
    }
}
