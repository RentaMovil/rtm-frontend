import { useCallback, useEffect, useRef, useState } from "react";

import { locationService } from "../services/locationService";

/**
 * Cada cuanto se vuelve a pedir la posicion. El apartado es un mapa con la
 * coordenada que manda el GPS, asi que tiene que refrescar solo; cuando el
 * tracker este conectado en serio, este mismo refresco es lo que ira leyendo
 * su senal.
 */
export const REFRESH_MS = 15000;

/**
 * Carga los vehiculos con telemetria activa y los mantiene al dia.
 *
 * El refresco es periodico y no se solapa: si una peticion sigue en vuelo cuando
 * toca la siguiente, se salta ese tick en vez de apilar llamadas.
 */
export function useVehicleLocations() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Evita que dos peticiones se pisen al tocar el siguiente tick.
    const enVuelo = useRef(false);

    const fetchVehicles = useCallback(async ({ silencioso = false } = {}) => {
        // Un refresco en segundo plano no debe ensuciar la pantalla: si falla se
        // conserva lo que ya habia y solo se registra la hora del ultimo ok.
        if (!silencioso) {
            setIsLoading(true);
            setError(null);
        }

        if (enVuelo.current) {
            if (!silencioso) setIsLoading(false);
            return;
        }
        enVuelo.current = true;

        try {
            const datos = await locationService.getTrackedVehicles();
            setVehicles(datos);
            setLastUpdated(new Date());
            if (silencioso) setError(null);
        } catch (err) {
            if (silencioso) {
                console.warn("No se pudo refrescar la ubicacion:", err.message);
            } else {
                setError(err.message);
            }
        } finally {
            enVuelo.current = false;
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Refresco periodico.
    useEffect(() => {
        const id = setInterval(() => {
            fetchVehicles({ silencioso: true });
        }, REFRESH_MS);

        return () => clearInterval(id);
    }, [fetchVehicles]);

    // Se para de refrescar si la pestana no esta delante: no hace falta pedir
    // posiciones de un vehiculo que nadie esta mirando.
    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState === "visible") {
                fetchVehicles({ silencioso: true });
            }
        };

        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, [fetchVehicles]);

    // Con la lista cargada, se elige el primer vehiculo para que el mapa no
    // quede vacio en la primera visita.
    useEffect(() => {
        setSelectedId((current) => {
            if (current && vehicles.some((v) => v.vehicle_id === current)) {
                return current;
            }
            return vehicles[0]?.vehicle_id ?? null;
        });
    }, [vehicles]);

    const selected = vehicles.find((v) => v.vehicle_id === selectedId) ?? null;

    return {
        vehicles,
        selected,
        selectedId,
        setSelectedId,
        lastUpdated,
        isLoading,
        error,
        refetch: fetchVehicles,
    };
}
