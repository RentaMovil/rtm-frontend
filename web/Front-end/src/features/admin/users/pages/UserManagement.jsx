import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiShield, FiUsers, FiUser, FiStar, FiTrendingUp, FiSearch, FiKey, FiX, FiAlertTriangle,
  FiUserX, FiUnlock,
} from "react-icons/fi";
import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { useAuth } from "../../../../contexts/AuthContext";
import { useDialog } from "../../../../shared/components/dialog/dialogContext";
import { useUsers } from "../hooks/useUsers";
import { useUpdateUserRole } from "../hooks/useUpdateUserRole";
import { useUpdateUserStatus } from "../hooks/useUpdateUserStatus";
import "./UserManagement.css";

export default function UserManagement() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const { confirm } = useDialog();

  const { users, isLoading, error, refetch } = useUsers();
  const { updateUserRole, isLoading: isSaving } = useUpdateUserRole();
  const { updateUserStatus, isLoading: isChangingStatus } = useUpdateUserStatus();
  const [statusError, setStatusError] = useState(null);

  // iam solo permite desactivar (ACTIVE -> INACTIVE) y desbloquear (BLOCKED -> ACTIVE).
  // Una cuenta INACTIVE no se puede reactivar desde aquí (entities-and-rules.md).
  const handleStatus = async (u, status) => {
    if (status === "INACTIVE") {
      const ok = await confirm({
        title: t("userManagement.deactivate"),
        message: t("userManagement.confirmDeactivate", { name: `${u.firstName} ${u.lastName}` }),
        confirmText: t("userManagement.deactivate"),
        danger: true,
      });
      if (!ok) return;
    }
    setStatusError(null);
    try {
      await updateUserStatus(u.id, status);
      await refetch();
    } catch (err) {
      setStatusError(err.message);
    }
  };

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modalUser, setModalUser] = useState(null);
  const [draftRole, setDraftRole] = useState("");
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = modalUser ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalUser]);

  const roleLabel = (role) => t(`userManagement.roles.${role}`);

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      term === "" ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = {
    ALL: users.length,
    CLIENT: users.filter((u) => u.role === "CLIENT").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    SUPER_ADMIN: users.filter((u) => u.role === "SUPER_ADMIN").length,
  };

  const kpis = users.length > 0 ? [
    {
      key: "total", label: t("userManagement.kpiTotal"), value: users.length,
      hint: t("userManagement.kpiTotalHint"), icon: FiUsers,
    },
    {
      key: "admins", label: t("userManagement.kpiAdmins"), value: counts.ADMIN + counts.SUPER_ADMIN,
      hint: t("userManagement.kpiAdminsHint"), icon: FiShield, tone: "amber",
    },
    {
      key: "active", label: t("userManagement.kpiActive"),
      value: `${Math.round((users.filter((u) => u.status === "ACTIVE").length / users.length) * 100)}%`,
      hint: t("userManagement.kpiActiveHint"), icon: FiTrendingUp, tone: "emerald",
    },
  ] : [];

  const chips = [
    { key: "ALL", label: t("userManagement.chipAll") },
    { key: "CLIENT", label: t("userManagement.chipClients") },
    { key: "ADMIN", label: t("userManagement.chipAdmins") },
    { key: "SUPER_ADMIN", label: t("userManagement.chipSuperAdmins") },
  ];

  const roleOptions = [
    { value: "CLIENT", desc: t("userManagement.roleDescClient") },
    { value: "ADMIN", desc: t("userManagement.roleDescAdmin") },
    { value: "SUPER_ADMIN", desc: t("userManagement.roleDescSuperAdmin") },
  ];

  const openRoleModal = (user) => {
    setModalError(null);
    setModalUser(user);
    setDraftRole(user.role);
  };

  const closeRoleModal = () => {
    setModalUser(null);
    setDraftRole("");
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      await updateUserRole(modalUser.id, draftRole);
      await refetch();
      closeRoleModal();
    } catch (err) {
      setModalError(err.message || "No se pudo actualizar el rol.");
    }
  };

  return (
    <div className="um-page">
      <NavBarAdmin />

      <div className="um-wrapper">
        <div className="um-header">
          <div>
            <h1 className="um-title">{t("userManagement.title")}</h1>
            <p className="um-subtitle">{t("userManagement.subtitle")}</p>
          </div>
          <div className="um-search-wrap">
            <FiSearch className="um-search-icon" />
            <input
              className="um-search"
              type="text"
              placeholder={t("userManagement.placeholderSearch")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading && <p className="um-empty">{t("userManagement.loading")}</p>}
        {!isLoading && error && <p className="um-empty">{error}</p>}
        {statusError && (
          <div className="um-warning">
            <FiAlertTriangle />
            <p>{statusError}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="um-kpis">
              {kpis.map(({ key, label, value, hint, icon: Icon, tone }) => (
                <div className="um-kpi" key={key}>
                  <div>
                    <p className="um-kpi-label">{label}</p>
                    <p className="um-kpi-value">{value}</p>
                    <p className={`um-kpi-hint ${tone || ""}`}>{hint}</p>
                  </div>
                  <Icon className={`um-kpi-icon ${tone || ""}`} />
                </div>
              ))}
            </div>

            <div className="um-card">
              <div className="um-chips">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    className={`um-chip ${roleFilter === chip.key ? "active" : ""}`}
                    onClick={() => setRoleFilter(chip.key)}
                  >
                    {chip.label} ({counts[chip.key]})
                  </button>
                ))}
              </div>

              <div className="um-table-wrap">
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>{t("userManagement.name")}</th>
                      <th>{t("userManagement.email")}</th>
                      <th className="center">{t("userManagement.role")}</th>
                      <th className="center">{t("userManagement.status")}</th>
                      <th className="right">{t("userManagement.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="um-user-cell">
                            <div>
                              <div className="um-user-name">
                                {u.firstName} {u.lastName}
                                {u.id === me?.id && ` (${t("userManagement.you")})`}
                              </div>
                              <div className="um-user-since">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="um-email">{u.email}</td>
                        <td className="center">
                          <span className={`um-role-badge role-${u.role.toLowerCase()}`}>
                            {u.role === "SUPER_ADMIN" && <FiStar />}
                            {u.role === "ADMIN" && <FiUser />}
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td className="center">
                          <span className={`um-status-badge status-${u.status.toLowerCase()}`}>
                            {t(`userManagement.statusLabel.${u.status}`)}
                          </span>
                        </td>
                        <td className="right">
                          {/* iam no deja cambiar el rol ni el estado de la propia cuenta */}
                          {u.id !== me?.id && (
                            <div style={{ display: "inline-flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <button className="um-btn-role" onClick={() => openRoleModal(u)}>
                                <FiKey /> {t("userManagement.changeRole")}
                              </button>
                              {u.status === "ACTIVE" && (
                                <button className="um-btn-role" disabled={isChangingStatus}
                                        onClick={() => handleStatus(u, "INACTIVE")}>
                                  <FiUserX /> {t("userManagement.deactivate")}
                                </button>
                              )}
                              {u.status === "BLOCKED" && (
                                <button className="um-btn-role" disabled={isChangingStatus}
                                        onClick={() => handleStatus(u, "ACTIVE")}>
                                  <FiUnlock /> {t("userManagement.unblock")}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="5" className="um-empty">{t("userManagement.notFound")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="um-pagination">
                {t("userManagement.showingCount", { count: filtered.length })}
              </div>
            </div>
          </>
        )}
      </div>

      <FooterAdmin />

      {modalUser && (
        <div className="um-modal-overlay" onClick={closeRoleModal}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h3><FiKey /> {t("userManagement.modal.title")}</h3>
              <button type="button" className="um-modal-close" onClick={closeRoleModal} aria-label={t("userManagement.modal.close")}>
                <FiX />
              </button>
            </div>

            <form id="roleForm" className="um-modal-form" onSubmit={handleSubmitRole}>
              <div className="um-user-preview">
                <div className="um-user-cell">
                  <div>
                    <div className="um-user-name">{modalUser.firstName} {modalUser.lastName}</div>
                    <div className="um-email">{modalUser.email}</div>
                  </div>
                </div>
                <span className={`um-status-badge status-${modalUser.status.toLowerCase()}`}>
                  {t(`userManagement.statusLabel.${modalUser.status}`)}
                </span>
              </div>

              <label className="um-modal-label">{t("userManagement.modal.selectRole")}</label>

              <div className="um-role-options">
                {roleOptions.map(({ value, desc }) => (
                  <label key={value} className={`um-role-option role-${value.toLowerCase()} ${draftRole === value ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="userRole"
                      value={value}
                      checked={draftRole === value}
                      onChange={(e) => setDraftRole(e.target.value)}
                    />
                    <div className="um-role-option-body">
                      <span className="um-role-option-title">
                        {value === "SUPER_ADMIN" && <FiStar />}
                        {value === "ADMIN" && <FiUser />}
                        {roleLabel(value)}
                        {value === "SUPER_ADMIN" && (
                          <span className="um-role-option-tag">{t("userManagement.modal.maxLevel")}</span>
                        )}
                      </span>
                      <span className="um-role-option-desc">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {draftRole === "SUPER_ADMIN" && (
                <div className="um-warning">
                  <FiAlertTriangle />
                  <div>
                    <strong>{t("userManagement.modal.warningTitle")}</strong>
                    <p>{t("userManagement.modal.warningText")}</p>
                  </div>
                </div>
              )}

              {modalError && (
                <div className="um-warning">
                  <FiAlertTriangle />
                  <p>{modalError}</p>
                </div>
              )}
            </form>

            <div className="um-modal-footer">
              <button type="button" className="um-btn-secondary" onClick={closeRoleModal} disabled={isSaving}>
                {t("userManagement.modal.cancel")}
              </button>
              <button type="submit" form="roleForm" className="um-btn-primary" disabled={isSaving}>
                {isSaving ? "Guardando..." : t("userManagement.modal.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}