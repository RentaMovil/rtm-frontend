import { useCallback, useEffect, useState } from "react";
import { getInsuranceOptions } from "../services/insuranceService";
import type { InsuranceType } from "../../../types";
import { isAbortError } from "../../../shared/api/httpClient";

export function useInsurance() {
    const [insurance, setInsurance] = useState<InsuranceType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsurance = useCallback(async (signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getInsuranceOptions({ signal });
            setInsurance(data);
        } catch (err: any) {
            if (isAbortError(err)) return;
            setError(err.message || "No se pudieron cargar los seguros.");
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void fetchInsurance(controller.signal);
        return () => controller.abort();
    }, [fetchInsurance]);

    return { insurance, isLoading, error, refetch: fetchInsurance };
}
