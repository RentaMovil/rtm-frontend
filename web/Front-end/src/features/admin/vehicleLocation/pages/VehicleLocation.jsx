import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiNavigation, FiClock, FiRefreshCw, FiAlertCircle, FiTruck, FiWifi } from "react-icons/fi";

import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { formatDate, formatTime } from "../../reservations/services/reservationHelpers";
import { useVehicleLocations, REFRESH_MS } from "../hooks/useVehicleLocations";
import VehicleMap from "../components/VehicleMap";
import "./VehicleLocation.css";

/** Formatea las coordenadas con 5 decimales: ~1 m de precision. */
function formatCoord(value) {
    return Number(value).toFixed(5);
}

export default function VehicleLocation() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const {
        vehicles,
        selected,
        selectedId,
        setSelectedId,
        lastUpdated,
        isLoading,
        error,
        refetch,
    } = useVehicleLocations();

    const stats = useMemo(() => ({
        conectados: vehicles.filter((v) => v.device?.connected).length,
    }), [vehicles]);

    const pos = selected?.position ?? null;

    // Si el tracker no esta conectado, la posicion que se ve es del ultimo
    // reporte guardado, no una senal en vivo. Se avisa, para no confundir.
    const signalLive = Boolean(selected?.device?.connected);
    const segundosRefresh = Math.round(REFRESH_MS / 1000);

    return (
        <div className="vl-page">
            <NavBarAdmin />

            <div className="vl-wrapper">
                <header className="vl-header">
                    <div>
                        <h1 className="vl-title">{t("vehicleLocation.title")}</h1>
                        <p className="vl-subtitle">{t("vehicleLocation.subtitle")}</p>
                    </div>

                    <div className="vl-header-tools">
                        <span className="vl-live">
                            <FiWifi />
                            {t("vehicleLocation.autoRefresh", { seconds: segundosRefresh })}
                        </span>

                        <button
                            type="button"
                            className="vl-btn-outline"
                            onClick={() => refetch()}
                            disabled={isLoading}
                        >
                            <FiRefreshCw className={isLoading ? "vl-spin" : ""} />
                            {t("vehicleLocation.refresh")}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="vl-error" role="alert">
                        <FiAlertCircle />
                        <div>
                            <strong>{t("vehicleLocation.errorTitle")}</strong>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {!error && (
                    <>
                        <section className="vl-kpis">
                            <div className="vl-kpi">
                                <span className="vl-kpi-label">{t("vehicleLocation.kpiTracked")}</span>
                                <strong className="vl-kpi-value">{vehicles.length}</strong>
                            </div>
                            <div className="vl-kpi">
                                <span className="vl-kpi-label">{t("vehicleLocation.kpiMoving")}</span>
                                <strong className="vl-kpi-value vl-kpi-value--on">{stats.moving}</strong>
                            </div>
                            <div className="vl-kpi">
                                <span className="vl-kpi-label">{t("vehicleLocation.kpiStopped")}</span>
                                <strong className="vl-kpi-value">{stats.stopped}</strong>
                            </div>
                            <div className="vl-kpi">
                                <span className="vl-kpi-label">{t("vehicleLocation.kpiLastUpdate")}</span>
                                <strong className="vl-kpi-value vl-kpi-value--time">
                                    {lastUpdated
                                        ? `${formatTime(lastUpdated, lang)} · ${formatDate(lastUpdated, lang)}`
                                        : "—"}
                                </strong>
                            </div>
                        </section>

                        {isLoading && !vehicles.length && (
                            <div className="vl-loading">
                                <p>{t("vehicleLocation.loading")}</p>
                            </div>
                        )}

                        {!isLoading && !vehicles.length && !error && (
                            <div className="vl-empty">
                                <FiTruck />
                                <p>{t("vehicleLocation.emptyTitle")}</p>
                                <span>{t("vehicleLocation.emptyHint")}</span>
                            </div>
                        )}

                        {!!vehicles.length && (
                            <div className="vl-grid">
                                {/* ── Lista de vehiculos ── */}
                                <aside className="vl-list">
                                    <h2 className="vl-list-title">{t("vehicleLocation.listTitle")}</h2>

                                    {vehicles.map((v) => {
                                        const moving = (v.position?.speed ?? 0) > 0;
                                        const isSelected = v.vehicle_id === selectedId;

                                        return (
                                            <button
                                                key={v.vehicle_id}
                                                type="button"
                                                className={`vl-card ${isSelected ? "active" : ""}`}
                                                onClick={() => setSelectedId(v.vehicle_id)}
                                            >
                                                <div className="vl-card-top">
                                                    <span className="vl-plate">{v.plate}</span>
                                                    <span
                                                        className={`vl-dot ${moving ? "vl-dot--moving" : "vl-dot--stopped"}`}
                                                        title={
                                                            moving
                                                                ? t("vehicleLocation.moving")
                                                                : t("vehicleLocation.stopped")
                                                        }
                                                    />
                                                </div>

                                                <p className="vl-card-name">
                                                    {v.brand} {v.model}
                                                </p>

                                                <dl className="vl-card-meta">
                                                    <div>
                                                        <dt>{t("vehicleLocation.rental")}</dt>
                                                        <dd>#{v.rental?.id ?? "—"}</dd>
                                                    </div>
                                                    <div>
                                                        <dt>{t("vehicleLocation.customer")}</dt>
                                                        <dd>{v.rental?.customer_name ?? "—"}</dd>
                                                    </div>
                                                </dl>

                                                <p className="vl-card-time">
                                                    <FiClock />
                                                    {v.position?.recordedAt
                                                        ? `${formatTime(v.position.recordedAt, lang)} · ${formatDate(v.position.recordedAt, lang)}`
                                                        : "—"}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </aside>

                                {/* ── Mapa + lectura de coordenadas ── */}
                                <section className="vl-detail">
                                    {selected ? (
                                        <>
                                            {!signalLive && (
                                                <p className="vl-offline" role="status">
                                                    <FiAlertCircle />
                                                    {t("vehicleLocation.deviceOffline", {
                                                        model: selected.device?.model ?? "—",
                                                    })}
                                                </p>
                                            )}

                                            <div className="vl-map">
                                                <VehicleMap
                                                    position={pos}
                                                    label={`${selected.brand} ${selected.model} · ${selected.plate}`}
                                                    detail={`${t("vehicleLocation.rental")} #${selected.rental?.id ?? "—"}`}
                                                    moved={selected.vehicle_id}
                                                />
                                            </div>

                                            <div className="vl-readout">
                                                <h2 className="vl-readout-title">
                                                    <FiNavigation />
                                                    {t("vehicleLocation.readoutTitle")}
                                                </h2>

                                                <dl className="vl-readout-grid">
                                                    <div className="vl-field">
                                                        <dt>
                                                            <FiMapPin />
                                                            {t("vehicleLocation.latitude")}
                                                        </dt>
                                                        <dd className="vl-mono">
                                                            {pos ? formatCoord(pos.latitude) : "—"}
                                                        </dd>
                                                    </div>

                                                    <div className="vl-field">
                                                        <dt>
                                                            <FiMapPin />
                                                            {t("vehicleLocation.longitude")}
                                                        </dt>
                                                        <dd className="vl-mono">
                                                            {pos ? formatCoord(pos.longitude) : "—"}
                                                        </dd>
                                                    </div>



                                                    <div className="vl-field">
                                                        <dt>
                                                            <FiClock />
                                                            {t("vehicleLocation.recordedAt")}
                                                        </dt>
                                                        <dd>
                                                            {pos?.recordedAt
                                                                ? `${formatTime(pos.recordedAt, lang)} · ${formatDate(pos.recordedAt, lang)}`
                                                                : "—"}
                                                        </dd>
                                                    </div>
                                                </dl>

                                                {selected.device && (
                                                    <p className="vl-readout-foot">
                                                        {t("vehicleLocation.device", {
                                                            model: selected.device.model,
                                                            provider: selected.device.provider ?? "—",
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="vl-empty vl-empty--inline">
                                            <FiTruck />
                                            <p>{t("vehicleLocation.selectVehicle")}</p>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </>
                )}
            </div>

            <FooterAdmin />
        </div>
    );
}
