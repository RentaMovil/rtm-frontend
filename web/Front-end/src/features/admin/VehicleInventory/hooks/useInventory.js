import { useCallback, useEffect, useState } from "react";
import { inventoryService } from "../services/inventoryService";
import { toInventoryViewModel } from "../services/inventoryMapper";

export function useInventory() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inventory, setInventory] = useState([]);

    const fetchInventory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await inventoryService.getAll();
            setInventory(response.map(toInventoryViewModel));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);
    return { inventory, isLoading, error, refetch: fetchInventory };
}