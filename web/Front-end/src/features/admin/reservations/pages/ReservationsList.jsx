import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiSearch, FiDownload, FiChevronRight, FiClipboard, FiAlertCircle, FiDollarSign,
} from "react-icons/fi";
import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { useReservationsAdmin } from "../../../booking/hooks/useReservationAdmin";
import { STATUS_ORDER, getTotal, getDisplayStatus, statusMeta, formatDate, formatTime, formatMoney } from "../services/reservationHelpers";
import "./Reservations.css";

const PAGE_SIZE = 5;

export default function ReservationsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { reservations, isLoading, error } = useReservationsAdmin();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const totalRevenue = useMemo(
    () =>
      reservations.filter((r) => r.status !== "PENDING_PAYMENT" && r.status !== "CANCELLED").reduce(
        (sum, r) => sum + getTotal(r),
        0
      ),
    [reservations]
  );
  const pendingReviewCount = reservations.filter((r) => r.status === "PENDING_REVIEW").length;

  const statusCounts = useMemo(() => {
    const counts = { ALL: reservations.length };
    STATUS_ORDER.forEach((s) => {
      counts[s] = reservations.filter((r) => r.status === s).length;
    });
    return counts;
  }, [reservations]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reservations.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (query) {
        const haystack = `${r.id} ${r.customer.name} ${r.vehicle.plate}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      const pickupDate = r.pickup.date.slice(0, 10);
      if (dateFrom && pickupDate < dateFrom) return false;
      if (dateTo && pickupDate > dateTo) return false;
      return true;
    });
  }, [reservations, statusFilter, search, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleExport = () => {
    const header = ["ID", "Cliente", "Vehiculo", "Placa", "Retiro", "Devolucion", "Sucursal", "Total", "Estado"];
    const rows = filtered.map((r) => [
      r.id, r.customer.name, r.vehicle.name, r.vehicle.plate,
      r.pickup.date, r.dropoff.date, r.pickup.branchName, getTotal(r), r.status,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reservas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rs-page">
      <NavBarAdmin />

      <div className="rs-wrapper">
        <div className="rs-header">
          <div>
            <h1 className="rs-title">{t("reservations.title")}</h1>
            <p className="rs-subtitle">{t("reservations.subtitle")}</p>
          </div>

          <div className="rs-kpis">
            <div className="rs-kpi">
              <span className="rs-kpi-icon slate"><FiClipboard /></span>
              <div>
                <p className="rs-kpi-label">{t("reservations.kpiTotal")}</p>
                <p className="rs-kpi-value">{reservations.length}</p>
              </div>
            </div>
            <div className="rs-kpi amber">
              <span className="rs-kpi-icon amber"><FiAlertCircle /></span>
              <div>
                <p className="rs-kpi-label">
                  {t("reservations.kpiPending")} <span className="rs-kpi-badge">{pendingReviewCount}</span>
                </p>
                <p className="rs-kpi-value small">{t("reservations.kpiPendingSub")}</p>
              </div>
            </div>
            <div className="rs-kpi">
              <span className="rs-kpi-icon emerald"><FiDollarSign /></span>
              <div>
                <p className="rs-kpi-label">{t("reservations.kpiRevenue")}</p>
                <p className="rs-kpi-value">{formatMoney(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading && <p className="rs-empty">{t("reservations.loading")}</p>}
        {!isLoading && error && <p className="rs-empty">{error}</p>}

        {!isLoading && !error && (
          <>
            <div className="rs-filters">
              <div className="rs-chips">
                <button className={`rs-chip ${statusFilter === "ALL" ? "active" : ""}`} onClick={() => changeFilter("ALL")}>
                  {t("reservations.chipAll")} <span>{statusCounts.ALL}</span>
                </button>
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    className={`rs-chip ${statusFilter === s ? "active" : ""} ${s === "PENDING_REVIEW" ? "priority" : ""}`}
                    onClick={() => changeFilter(s)}
                  >
                    {s === "PENDING_REVIEW" && <span className="rs-chip-dot" />}
                    {statusMeta(s, t).label} <span>{statusCounts[s]}</span>
                  </button>
                ))}
              </div>

              <div className="rs-controls">
                <div className="rs-search">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder={t("reservations.searchPlaceholder")}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>

                <div className="rs-date-range">
                  <span>{t("reservations.dateFrom")}</span>
                  <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
                  <span className="rs-date-sep">|</span>
                  <span>{t("reservations.dateTo")}</span>
                  <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
                </div>

                <button type="button" className="rs-btn-outline" onClick={handleExport}>
                  <FiDownload /> {t("reservations.export")}
                </button>
              </div>
            </div>

            <div className="rs-card">
              <div className="rs-table-wrap">
                <table className="rs-table">
                  <thead>
                    <tr>
                      <th>{t("reservations.colId")}</th>
                      <th>{t("reservations.colCustomer")}</th>
                      <th>{t("reservations.colVehicle")}</th>
                      <th>{t("reservations.colDates")}</th>
                      <th>{t("reservations.colBranch")}</th>
                      <th>{t("reservations.colTotal")}</th>
                      <th className="right">{t("reservations.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((r) => {
                      const meta = statusMeta(getDisplayStatus(r), t);
                      return (
                        <tr key={r.id} onClick={() => navigate(`/reservations/${r.id}`)}>
                          <td className="rs-id">#{r.id}</td>
                          <td>
                            <div className="rs-cell-title">{r.customer.name}</div>
                            <div className="rs-cell-sub mono">{r.customer.email}</div>
                          </td>
                          <td>
                            <div className="rs-cell-vehicle">
                              {r.vehicle.img ? (
                                <img className="rs-vehicle-thumb" src={r.vehicle.img} alt={r.vehicle.name} />
                              ) : (
                                <span className="rs-vehicle-thumb rs-vehicle-thumb-empty" aria-hidden="true">🚗</span>
                              )}
                              <div>
                                <div className="rs-cell-title">{r.vehicle.name}</div>
                                <div className="rs-cell-sub">
                                  {r.vehicle.category} • {t("reservations.plate")} <span className="mono strong">{r.vehicle.plate}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="rs-cell-title small">
                              {formatDate(r.pickup.date, i18n.language)} ({formatTime(r.pickup.date, i18n.language)})
                              <span className="rs-arrow"> → </span>
                              {formatDate(r.dropoff.date, i18n.language)} ({formatTime(r.dropoff.date, i18n.language)})
                            </div>
                            <div className="rs-cell-sub">{t("reservations.duration", { count: r.durationDays })}</div>
                          </td>
                          <td>
                            <div className="rs-cell-title small">{r.pickup.branchName}</div>
                            <div className="rs-cell-sub">
                              {r.pickup.branchName === r.dropoff.branchName
                                ? t("reservations.sameBranch")
                                : `${t("reservations.dropoffLabel")}: ${r.dropoff.branchName}`}
                            </div>
                          </td>
                          <td className="rs-total">{formatMoney(getTotal(r))}</td>
                          <td className="right">
                            <span className={`rs-status-badge ${meta.className}`}>
                              <span className="rs-status-dot" />
                              {meta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="rs-empty">
                  <p>{t("reservations.emptyTitle")}</p>
                  <button
                    type="button"
                    className="rs-btn-outline"
                    onClick={() => { changeFilter("ALL"); setSearch(""); setDateFrom(""); setDateTo(""); }}
                  >
                    {t("reservations.clearFilters")}
                  </button>
                </div>
              )}

              {filtered.length > 0 && (
                <div className="rs-pagination">
                  <span>
                    {t("reservations.showingRange", {
                      from: (currentPage - 1) * PAGE_SIZE + 1,
                      to: Math.min(currentPage * PAGE_SIZE, filtered.length),
                      total: filtered.length,
                    })}
                  </span>
                  <div className="rs-page-buttons">
                    <button type="button" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      {t("reservations.previous")}
                    </button>
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                      <button key={n} type="button" className={n === currentPage ? "active" : ""} onClick={() => setPage(n)}>
                        {n}
                      </button>
                    ))}
                    <button type="button" disabled={currentPage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                      {t("reservations.next")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <FooterAdmin />
    </div>
  );
}