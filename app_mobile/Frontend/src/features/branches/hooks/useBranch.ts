import { useCallback, useEffect, useState } from "react";
import { getBranches } from "../services/branchService";
import type { Branch } from "../../../types";

export function useBranches() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBranches = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getBranches();
            setBranches(data);
        } catch (err: any) {
            setError(err.message || "No se pudieron cargar las sucursales.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchBranches(); }, [fetchBranches]);

    return { branches, isLoading, error, refetch: fetchBranches };
}