// hooks/useBankAccounts.ts
import { useCallback, useEffect, useState } from "react";
import type { BankAccount } from "../../../types";
import { getActiveBankAccounts } from "../services/paymentService";

export function useBankAccounts() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            setAccounts(await getActiveBankAccounts());
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);
    return { accounts, isLoading, refetch: fetchAccounts };
}