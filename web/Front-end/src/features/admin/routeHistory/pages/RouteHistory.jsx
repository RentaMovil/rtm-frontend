import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiClock, FiRefreshCw, FiAlertCircle, FiMapPin, FiNavigation, FiArrowRight, FiFilter, FiTruck } from "react-icons/fi";

import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { formatDate, formatTime } from "../../reservations/services/reservationHelpers";
import { fromApiDateTime } from "../../../../shared/utils/apiDate";
import { useVehicleLocations, REFRESH_MS } from "../../vehicleLocation/hooks/useVehicleLocations";
import { locationService } from "../../vehicleLocation/services/locationService";
import RouteMap from "../components/RouteMap";
import "./RouteHistory.css";

/** "YYYY-MM-DDTHH:mm" en hora local, lo que pide un <input type="datetime-local">. */
function toDatetimeLocal(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Historial de rutas.
 *
 * A diferencia del historial de mantenimientos (que vive en /History), esta
 * pagina responde una pregunta del dia a dia del administrador: que reservas
 * estan activas ahorita mismo y por lo tanto hay que rastrear. La fuente es el
 * mismo endpoint que alimenta la ubicacion de la flota, asi que ambas paginas
 * cuentan siempre lo mismo.
 *
 * Al elegir un vehiculo se puede filtrar por fecha/hora y dibujar en el mapa
 * el recorrido real reportado en esa ventana (GET /tracking/{rentalId}/history).
 */
export default function RouteHistory() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const { vehicles, lastUpdated, isLoading, error, refetch } = useVehicleLocations();

    // El gateway responde 503 si telemetry-gps no está levantado. No es un fallo del
    // usuario: se trata como "aún no hay datos" y se muestra el estado vacío.
    const servicioNoDisponible = error?.status === 503 || error?.status === 404;

    // El endpoint solo devuelve vehiculos con un alquiler en curso, asi que la
    // lista que llega ya es la de reservas activas. Se filtra igual por si
    // alguno llega sin la referencia al alquiler.
    const pendientes = useMemo(
        () => vehicles.filter((v) => v.rental?.id != null),
        [vehicles]
    );

    // Un reporte viejo es senal de que el vehiculo lleva rato sin reportar:
    // es justo lo que el admin necesita notar para investigar. La antiguedad se
    // mide contra la hora de la ultima respuesta, no contra el reloj del
    // render: asi lo que se muestra siempre corresponde a los datos que hay en
    // pantalla.
    const SIN_SENAL_HORAS = 2;

    const sinSenal = useMemo(() => {
        if (!lastUpdated) return [];

        const referencia = lastUpdated.getTime();

        return pendientes.filter((v) => {
            const registrada = v.position?.recordedAt;
            if (!registrada) return true;
            const horas = (referencia - new Date(fromApiDateTime(registrada)).getTime()) / 36e5;
            return horas > SIN_SENAL_HORAS;
        });
    }, [pendientes, lastUpdated]);

    const segundosRefresh = Math.round(REFRESH_MS / 1000);

    // ── Ruta del vehiculo seleccionado ──
    const [selectedId, setSelectedId] = useState(null);
    const [from, setFrom] = useState(() => toDatetimeLocal(startOfToday()));
    const [to, setTo] = useState(() => toDatetimeLocal(new Date()));
    const [routePoints, setRoutePoints] = useState(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [routeError, setRouteError] = useState(null);

    const selected = pendientes.find((v) => v.vehicle_id === selectedId) ?? null;

    const selectVehicle = (v) => {
        setSelectedId(v.vehicle_id);
        setRoutePoints(null);
        setRouteError(null);
    };

    const loadRoute = async () => {
        if (!selected?.rental?.id) return;

        const fromDate = from ? new Date(from) : null;
        const toDate = to ? new Date(to) : null;

        setIsLoadingRoute(true);
        setRouteError(null);

        try {
            const allPoints = await locationService.getTrack(selected.rental.id);

            const filtered = allPoints
                .filter((p) => {
                    // "Null Island": el placeholder que manda el GPS mientras todavía no tiene
                    // fix. El backend ya lo rechaza a partir de ahora, pero reportes viejos
                    // pueden seguir teniendo uno guardado.
                    if (Number(p.latitude) === 0 && Number(p.longitude) === 0) return false;

                    const recorded = new Date(fromApiDateTime(p.recordedAt)).getTime();
                    if (fromDate && recorded < fromDate.getTime()) return false;
                    if (toDate && recorded > toDate.getTime()) return false;
                    return true;
                })
                .sort((a, b) => new Date(fromApiDateTime(a.recordedAt)) - new Date(fromApiDateTime(b.recordedAt)));

            setRoutePoints(filtered);
        } catch (err) {
            setRouteError(err.message ?? t("routeHistory.routeError"));
        } finally {
            setIsLoadingRoute(false);
        }
    };

    return (
        <div className="rh-page">
            <NavBarAdmin />

            <div className="rh-wrapper">
                <header className="rh-header">
                    <div>
                        <h1 className="rh-title">{t("routeHistory.title")}</h1>
                        <p className="rh-subtitle">{t("routeHistory.subtitle")}</p>
                    </div>

                    <div className="rh-header-tools">
                        <span className="rh-live">
                            <FiRefreshCw />
                            {t("routeHistory.autoRefresh", { seconds: segundosRefresh })}
                        </span>

                        <button
                            type="button"
                            className="rh-btn-outline"
                            onClick={() => refetch()}
                            disabled={isLoading}
                        >
                            <FiRefreshCw className={isLoading ? "rh-spin" : ""} />
                            {t("routeHistory.refresh")}
                        </button>
                    </div>
                </header>

                {error && !servicioNoDisponible && (
                    <div className="rh-error" role="alert">
                        <FiAlertCircle />
                        <div>
                            <strong>{t("routeHistory.errorTitle")}</strong>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {servicioNoDisponible && (
                    <div className="rh-notice rh-notice--info">
                        <div className="rh-notice-body">
                            <p>{t("routeHistory.serviceUnavailable")}</p>
                        </div>
                    </div>
                )}

                {(!error || servicioNoDisponible) && (
                    <>
                        {/* ── Aviso principal: cuantas reservas hay para rastrear ── */}
                        {isLoading && !pendientes.length && (
                            <div className="rh-loading">
                                <p>{t("routeHistory.loading")}</p>
                            </div>
                        )}

                        {!isLoading && !pendientes.length && (
                            <div className="rh-empty">
                                <FiMapPin />
                                <p>{t("routeHistory.emptyTitle")}</p>
                                <span>{t("routeHistory.emptyHint")}</span>
                            </div>
                        )}

                        {!!pendientes.length && (
                            <>
                                <section
                                    className={`rh-notice ${sinSenal.length ? "rh-notice--warn" : ""}`}
                                    role="status"
                                >
                                    <FiNavigation />

                                    <div className="rh-notice-body">
                                        <strong>
                                            {t("routeHistory.pending", { count: pendientes.length })}
                                        </strong>
                                        <p>
                                            {sinSenal.length
                                                ? t("routeHistory.pendingWarn", {
                                                      count: sinSenal.length,
                                                  })
                                                : t("routeHistory.pendingHint")}
                                        </p>
                                    </div>

                                    <Link to="/VehicleLocation" className="rh-notice-cta">
                                        {t("routeHistory.openFleet")}
                                        <FiArrowRight />
                                    </Link>
                                </section>

                                <div className="rh-grid">
                                    <section className="rh-list">
                                        <h2 className="rh-list-title">
                                            {t("routeHistory.listTitle")}
                                            <span className="rh-list-count">{pendientes.length}</span>
                                        </h2>

                                        {pendientes.map((v) => {
                                            const registrada = v.position?.recordedAt;
                                            const sinReportar = sinSenal.includes(v);
                                            const isSelected = v.vehicle_id === selectedId;

                                            return (
                                                <button
                                                    key={v.vehicle_id}
                                                    type="button"
                                                    className={`rh-card ${isSelected ? "active" : ""}`}
                                                    onClick={() => selectVehicle(v)}
                                                >
                                                    <div className="rh-card-head">
                                                        <span className="rh-plate">{v.plate}</span>
                                                        <span
                                                            className={`rh-status ${sinReportar ? "rh-status--off" : "rh-status--on"}`}
                                                        >
                                                            {sinReportar
                                                                ? t("routeHistory.noSignal")
                                                                : t("routeHistory.live")}
                                                        </span>
                                                    </div>

                                                    <p className="rh-card-vehicle">
                                                        {v.brand} {v.model}
                                                    </p>

                                                    <dl className="rh-card-meta">
                                                        <div>
                                                            <dt>{t("routeHistory.rental")}</dt>
                                                            <dd>#{v.rental?.id ?? "—"}</dd>
                                                        </div>
                                                        <div>
                                                            <dt>{t("routeHistory.customer")}</dt>
                                                            <dd>{v.rental?.customer_name ?? "—"}</dd>
                                                        </div>
                                                    </dl>

                                                    <p className="rh-card-time">
                                                        <FiClock />
                                                        {registrada
                                                            ? `${formatTime(registrada, lang)} · ${formatDate(registrada, lang)}`
                                                            : t("routeHistory.noReport")}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </section>

                                    <section className="rh-route">
                                        {!selected && (
                                            <div className="rh-empty rh-empty--inline">
                                                <FiTruck />
                                                <p>{t("routeHistory.selectVehicle")}</p>
                                            </div>
                                        )}

                                        {selected && (
                                            <>
                                                <div className="rh-route-filter">
                                                    <div className="rh-route-filter-field">
                                                        <label htmlFor="rh-from">{t("routeHistory.fromLabel")}</label>
                                                        <input
                                                            id="rh-from"
                                                            type="datetime-local"
                                                            value={from}
                                                            onChange={(e) => setFrom(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="rh-route-filter-field">
                                                        <label htmlFor="rh-to">{t("routeHistory.toLabel")}</label>
                                                        <input
                                                            id="rh-to"
                                                            type="datetime-local"
                                                            value={to}
                                                            onChange={(e) => setTo(e.target.value)}
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="rh-btn-primary"
                                                        onClick={loadRoute}
                                                        disabled={isLoadingRoute}
                                                    >
                                                        <FiFilter />
                                                        {t("routeHistory.viewRoute")}
                                                    </button>
                                                </div>

                                                {routeError && (
                                                    <p className="rh-route-error" role="alert">
                                                        <FiAlertCircle />
                                                        {routeError}
                                                    </p>
                                                )}

                                                {routePoints && !routePoints.length && !routeError && (
                                                    <p className="rh-route-empty">{t("routeHistory.noRoutePoints")}</p>
                                                )}

                                                {routePoints && !!routePoints.length && (
                                                    <p className="rh-route-count">
                                                        {t("routeHistory.routePointsCount", { count: routePoints.length })}
                                                    </p>
                                                )}

                                                <div className="rh-map">
                                                    <RouteMap
                                                        points={routePoints ?? []}
                                                        label={`${selected.brand} ${selected.model} · ${selected.plate}`}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </section>
                                </div>

                                {lastUpdated && (
                                    <p className="rh-foot">
                                        {t("routeHistory.updatedAt", {
                                            time: formatTime(lastUpdated, lang),
                                            date: formatDate(lastUpdated, lang),
                                        })}
                                    </p>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <FooterAdmin />
        </div>
    );
}
