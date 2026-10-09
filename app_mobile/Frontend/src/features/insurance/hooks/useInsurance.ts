import { useCallback, useEffect, useState } from "react";
import { getInsuranceOptions } from "../services/insuranceService";
import type { InsuranceType } from "../../../types";

export function useInsurance() {
    const [insurance, setInsurance] = useState<InsuranceType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsurance = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getInsuranceOptions();
            setInsurance(data);
        } catch (err: any) {
            setError(err.message || "No se pudieron cargar los seguros.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchInsurance(); }, [fetchInsurance]);

    return { insurance, isLoading, error, refetch: fetchInsurance };
}