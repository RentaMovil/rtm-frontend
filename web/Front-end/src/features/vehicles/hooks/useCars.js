import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { carsService } from "../Services/carsService";
import { toClientVehicleViewModel } from "../Services/carsMapper";
import { branchService } from "../../admin/branches/services/branchService";

// allStatuses: true = flota completa (pantallas de admin); por defecto, solo el catálogo AVAILABLE
export  function useCars({ allStatuses = false } = {}) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cars, setCars] = useState([]);

    const fetchVehicle = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [vehiclesResponse, branchesResponse] = await Promise.all([
                allStatuses ? carsService.getAllForAdmin() : carsService.getAll(),
                branchService.getAll(),
            ]);

            // 1. Blindamos branchesResponse asegurando que sea un array antes de mapear
            const safeBranches = Array.isArray(branchesResponse) ? branchesResponse : [];
            const branchesById = Object.fromEntries(safeBranches.map((b) => [b.id, b]));

            // 2. Blindamos vehiclesResponse usando encadenamiento opcional y fallback a []
            const safeVehicles = Array.isArray(vehiclesResponse) ? vehiclesResponse : [];
            setCars(safeVehicles.map((v) => toClientVehicleViewModel(v, branchesById)));

        } catch (err) {
            setError(err.message || t("vehicles.loadError"));
        } finally {
            setIsLoading(false);
        }
    }, [allStatuses]);

    useEffect(() => { fetchVehicle(); }, [fetchVehicle]);

    return { cars, isLoading, error, refetch: fetchVehicle };
}