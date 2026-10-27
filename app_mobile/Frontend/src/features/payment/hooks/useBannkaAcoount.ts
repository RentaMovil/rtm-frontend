// hooks/useBankAccounts.ts
import { useCallback, useEffect, useState } from "react";
import type { BankAccount } from "../../../types";
import { getActiveBankAccounts } from "../services/paymentService";
import { isAbortError } from "../../../shared/api/httpClient";

export function useBankAccounts() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAccounts = useCallback(async (signal?: AbortSignal) => {
        setIsLoading(true);
        try {
            setAccounts(await getActiveBankAccounts({ signal }));
        } catch (error) {
            if (!isAbortError(error)) console.error("No se pudieron cargar las cuentas bancarias.", error);
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void fetchAccounts(controller.signal);
        return () => controller.abort();
    }, [fetchAccounts]);
    return { accounts, isLoading, refetch: fetchAccounts };
}
