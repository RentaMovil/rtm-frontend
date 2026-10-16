import { useState, useEffect, useRef } from "react";
import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { useNavigate } from "react-router-dom";
import "./VehicleInventory.css";
import { useTranslation } from "react-i18next";
import { useInventory } from "../hooks/useInventory";
import carro from "../../../../assets/carro.png";
import { TfiLayoutGrid2Alt, TfiMenu } from "react-icons/tfi";
import { FiSearch, FiX, FiEdit2 } from "react-icons/fi";
import VehicleEditModal from "../components/VehicleEditModal";

export default function VehicleInventory() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { inventory: vehicles, isLoading, error, refetch } = useInventory();
  // Vehículo abierto en el modal de edición
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    estado: null,
    sucursal: null,
    tipo: null,
    marca: null,
    modelo: null,
  });
  const [vista, setVista] = useState("grid");

  const filtersRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterClick = (filterType) =>
    setActiveFilter(activeFilter === filterType ? null : filterType);

  const handleFilterSelect = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: ["Todos", "Todas"].includes(value) || prev[filterType] === value ? null : value,
    }));
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedFilters({ estado: null, sucursal: null, tipo: null, marca: null, modelo: null });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (v) => v !== null,
  );

  const ESTADOS = [
    { value: "Todos", label: t("VehicleInventary.all_m") },
    { value: "Disponible", label: t("VehicleInventary.available") },
    { value: "En uso", label: t("VehicleInventary.inUse") },
    { value: "Mantenimiento", label: t("VehicleInventary.maintenance") },
    { value: "Retirado", label: t("VehicleInventary.retired") },
  ];

  const SUCURSALES = [
    { value: "Todas", label: t("VehicleInventary.all_f") },
    ...[...new Set(vehicles.map((v) => v.sucursal || v.branch))]
      .filter(Boolean)
      .map((suc) => ({ value: suc, label: suc })),
  ];

  const TIPOS = [
    { value: "Todos", label: t("VehicleInventary.all_m") },
    ...[...new Set(vehicles.map((v) => v.tipo || v.type))]
      .filter(Boolean)
      .map((tipo) => ({ value: tipo, label: tipo })),
  ];

  const MARCAS = [...new Set(vehicles.map((v) => v.marca))].filter(Boolean);
  const MODELOS = [...new Set(vehicles.map((v) => v.modelo))].filter(Boolean);

  const FILTERS = [
    { key: "estado", label: t("VehicleInventary.keyState"), options: ESTADOS },
    { key: "sucursal", label: t("VehicleInventary.keyBranch"), options: SUCURSALES },
    { key: "tipo", label: t("VehicleInventary.keyType"), options: TIPOS },
    { key: "marca", label: t("VehicleInventary.brand", "Marca"), options: [{ value: "Todas", label: t("VehicleInventary.all_f") }, ...MARCAS.map((value) => ({ value, label: value }))] },
    { key: "modelo", label: t("VehicleInventary.model", "Modelo"), options: [{ value: "Todos", label: t("VehicleInventary.all_m") }, ...MODELOS.map((value) => ({ value, label: value }))] },
  ];

  const filtered = vehicles.filter(
    (v) =>
      (search.trim() === "" ||
        [v.placa, v.marca, v.modelo, v.tipo, v.sucursal]
          .some((value) => String(value || "").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))) &&
      (selectedFilters.estado === null ||
        selectedFilters.estado === "Todos" ||
        v.estado === selectedFilters.estado) &&
      (selectedFilters.sucursal === null ||
        selectedFilters.sucursal === "Todas" ||
        (v.sucursal || v.branch) === selectedFilters.sucursal) &&
      (selectedFilters.tipo === null ||
        selectedFilters.tipo === "Todos" ||
        (v.tipo || v.type) === selectedFilters.tipo) &&
      (selectedFilters.marca === null || selectedFilters.marca === "Todas" || v.marca === selectedFilters.marca) &&
      (selectedFilters.modelo === null || selectedFilters.modelo === "Todos" || v.modelo === selectedFilters.modelo),
  );

  const stats = {
    total: vehicles.length,
    disponible: vehicles.filter((v) => v.estado === "Disponible").length,
    enUso: vehicles.filter((v) => v.estado === "En uso").length,
    mantenimiento: vehicles.filter((v) => v.estado === "Mantenimiento").length,
  };

  const badgeClass = (estado) =>
    `vi-badge ${estado ? estado.toLowerCase().replace(/\s+/g, "-") : "disponible"}`;

  return (
    <div className="vi-page">
      <NavBarAdmin />

      <div className="vi-wrapper">
        <div className="vi-header">
          <div>
            <h1 className="vi-title">{t("VehicleInventary.title")}</h1>
            <p className="vi-subtitle">{t("VehicleInventary.subtitle")}</p>
          </div>
          <button
            className="vi-btn-add"
            onClick={() => navigate("/RegisterVehicle")}
          >
            {t("VehicleInventary.btnAddVehicle")}
          </button>
        </div>

        {isLoading && (
          <div className="vi-loading-container">
            <p>{t("VehicleInventary.loading") || "Cargando vehículos..."}</p>
          </div>
        )}

        {error && (
          <div className="vi-error-container">
            <p style={{ color: "red" }}>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="vi-stats">
              <div className="vi-stat">
                <span className="vi-stat-num">{stats.total}</span>
                <span className="vi-stat-label">{t("VehicleInventary.total")}</span>
              </div>
              <div className="vi-stat disponible">
                <span className="vi-stat-num">{stats.disponible}</span>
                <span className="vi-stat-label">{t("VehicleInventary.available")}</span>
              </div>
              <div className="vi-stat en-uso">
                <span className="vi-stat-num">{stats.enUso}</span>
                <span className="vi-stat-label">{t("VehicleInventary.inUse")}</span>
              </div>
              <div className="vi-stat mantenimiento">
                <span className="vi-stat-num">{stats.mantenimiento}</span>
                <span className="vi-stat-label">{t("VehicleInventary.maintenance")}</span>
              </div>
            </div>

            <div className="vi-controls">
              <div className="vi-search-wrap">
                <FiSearch className="vi-search-icon" aria-hidden="true" />
                <input
                  className="vi-search"
                  type="text"
                  placeholder={t("VehicleInventary.placeholderSearch")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button type="button" className="vi-search-clear" aria-label={t("VehicleInventary.clearSearch")} onClick={() => setSearch("")}><FiX /></button>}
              </div>

              <div className="vi-filters" ref={filtersRef}>
                {FILTERS.map(({ key, label, options }) => (
                  <div className="vi-filter-wrap" key={key}>
                    <button type="button" className={`vi-filter-btn ${activeFilter === key ? "active" : ""} ${selectedFilters[key] !== null ? "selected" : ""}`} onClick={() => handleFilterClick(key)} aria-expanded={activeFilter === key}>
                      {label}{selectedFilters[key] !== null ? `: ${options.find((option) => option.value === selectedFilters[key])?.label || selectedFilters[key]}` : ""}<span className="vi-filter-arrow">▾</span>
                    </button>
                    {activeFilter === key && <div className="vi-dropdown" role="listbox" aria-label={label}>{options.map((option) => <button type="button" key={option.value} className={`vi-dropdown-item ${selectedFilters[key] === option.value ? "chosen" : ""}`} onClick={() => { handleFilterSelect(key, option.value); setActiveFilter(null); }}>{option.label}</button>)}</div>}
                  </div>
                ))}
                {hasActiveFilters || search ? <button type="button" className="vi-clear-btn" onClick={clearAllFilters}>{t("VehicleInventary.CleanFilters")}</button> : null}
              </div>

              <div className="vi-view-toggle">
                <button
                  className={`vi-view-btn ${vista === "grid" ? "active" : ""}`}
                  onClick={() => setVista("grid")}
                  title={t("VehicleInventary.cuadTitle")}
                >
                  <TfiLayoutGrid2Alt size={18} />
                </button>

                <button
                  className={`vi-view-btn ${vista === "tabla" ? "active" : ""}`}
                  onClick={() => setVista("tabla")}
                  title={t("VehicleInventary.cuadTitle2")}
                >
                  <TfiMenu size={18} />
                </button>
              </div>
            </div>

            <p className="vi-results-count">{t("VehicleInventary.resultsCount", { count: filtered.length })}</p>

            {filtered.length === 0 ? (
              <div className="vi-empty">
                <p>{t("VehicleInventary.noMatch")}</p>
              </div>
            ) : vista === "grid" ? (
              <div className="vi-grid">
                {filtered.map((v) => (
                  <div key={v.id || v.placa} className="vi-card">
                    <div className="vi-card-img-wrap">
                      <img
                        src={v.imagen || carro}
                        alt={v.modelo || "Vehículo"}
                        className="vi-card-img"
                      />
                      <span className={badgeClass(v.estado)}>{v.estado}</span>
                    </div>
                    <div className="vi-card-body">
                      <h3 className="vi-card-title">
                        {v.marca} {v.modelo}
                      </h3>
                      <p className="vi-card-plate">
                        Placa: <strong>{v.placa}</strong>
                      </p>
                      <p className="vi-card-info">
                        Sucursal: {v.sucursal || v.branch || "—"}
                      </p>
                      <p className="vi-card-info">
                        Tipo: {v.tipo || v.type || "—"}
                      </p>
                      <button
                        className="vi-btn-edit"
                        aria-label={t("VehicleInventary.editAria", { name: `${v.marca} ${v.modelo}` })}
                        onClick={() => setEditing(v)}
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vi-table-container">
                <table className="vi-table">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Marca / Modelo</th>
                      <th>{t("VehicleInventary.state")}</th>
                      <th>Sucursal</th>
                      <th>Tipo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((v) => (
                      <tr key={v.id || v.placa}>
                        <td>
                          <strong>{v.placa}</strong>
                        </td>
                        <td>
                          {v.marca} {v.modelo}
                        </td>
                        <td>
                          <span className={badgeClass(v.estado)}>{v.estado}</span>
                        </td>
                        <td>{v.sucursal || v.branch || "—"}</td>
                        <td>{v.tipo || v.type || "—"}</td>
                        <td>
                          <button
                            className="vi-btn-edit"
                            aria-label={t("VehicleInventary.editAria", { name: `${v.marca} ${v.modelo}` })}
                            onClick={() => setEditing(v)}
                          >
                            <FiEdit2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {editing && (
        <VehicleEditModal
          key={editing.id ?? editing.placa}
          vehicle={editing}
          onClose={() => setEditing(null)}
          onSaved={refetch}
        />
      )}

      <FooterAdmin />
    </div>
  );
}
