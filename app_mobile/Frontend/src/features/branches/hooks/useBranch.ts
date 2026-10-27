import { useCallback, useEffect, useState } from "react";
import { getBranches } from "../services/branchService";
import { isAbortError } from "../../../shared/api/httpClient";
import type { Branch } from "../../../types";

export function useBranches() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBranches = useCallback(async (signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getBranches({ signal });
            setBranches(data);
        } catch (err: any) {
            if (isAbortError(err)) return;
            setError(err.message || "No se pudieron cargar las sucursales.");
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void fetchBranches(controller.signal);
        return () => controller.abort();
    }, [fetchBranches]);

    return { branches, isLoading, error, refetch: fetchBranches };
}
