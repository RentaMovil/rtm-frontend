import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import {
  FiCreditCard, FiCheckCircle, FiXCircle, FiPlus, FiX, FiUploadCloud, FiAlertTriangle, FiInfo,
} from "react-icons/fi";
import NavBarAdmin from "../../../../shared/components/layout/NavBarAdmin";
import FooterAdmin from "../../../../shared/components/layout/FooterAdmin";
import { useBankAccounts } from "../hooks/useBankAccounts";
import { useCreateBankAccount } from "../hooks/useCreateBankAccount";
import { useSetBankAccountActive } from "../hooks/useSetBankAccountActive";
import { useImageUpload } from "../../../../shared/hooks/useImageUpload";
import "./BankAccounts.css";

function QrDropzone({ onFileChange, error, t }) {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((accepted) => {
    const picked = accepted[0];
    if (!picked) return;
    onFileChange(picked);
    setPreview(URL.createObjectURL(picked));
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 2 * 1024 * 1024,
  });

  return (
    <div {...getRootProps()} className={`ba-dropzone ${error ? "error" : ""}`}>
      <input {...getInputProps()} />
      {preview ? (
        <img src={preview} alt="QR" className="ba-dropzone-preview" />
      ) : (
        <>
          <FiUploadCloud className="ba-dropzone-icon" />
          <p className="ba-dropzone-text">
            {isDragActive ? t("bankAccounts.modal.dropActive") : t("bankAccounts.modal.dropText")}
          </p>
          <p className="ba-dropzone-hint">{t("bankAccounts.modal.dropHint")}</p>
        </>
      )}
    </div>
  );
}

export default function BankAccounts() {
  const { t } = useTranslation();

  const { accounts, isLoading, error, refetch } = useBankAccounts();
  const { createBankAccount, isLoading: isCreating } = useCreateBankAccount();
  const { setActive, isLoading: isToggling } = useSetBankAccountActive();
  const { uploadImage, isUploading } = useImageUpload();

  const [showAddModal, setShowAddModal] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [qrError, setQrError] = useState(false);
  const [formError, setFormError] = useState(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);

  useEffect(() => {
    const isAnyModalOpen = showAddModal || Boolean(pendingDeactivate);
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAddModal, pendingDeactivate]);

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.isActive).length,
    inactive: accounts.filter((a) => !a.isActive).length,
  };

  const kpis = [
    { key: "total", label: t("bankAccounts.total"), value: stats.total, icon: FiCreditCard },
    { key: "active", label: t("bankAccounts.active"), value: stats.active, icon: FiCheckCircle, tone: "active" },
    { key: "inactive", label: t("bankAccounts.inactive"), value: stats.inactive, icon: FiXCircle, tone: "inactive" },
  ];

  const closeAddModal = () => {
    setShowAddModal(false);
    setQrFile(null);
    setQrError(false);
    setFormError(null);
  };

  const handleQrChange = (file) => {
    setQrFile(file);
    if (file) setQrError(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!qrFile) {
      setQrError(true);
      return;
    }

    const data = new FormData(e.target);

    try {
      const qrImageUrl = await uploadImage(qrFile);
      await createBankAccount({
        bankName: data.get("bankName"),
        holderName: data.get("holderName"),
        qrImageUrl,
      });
      await refetch();
      closeAddModal();
    } catch (err) {
      setFormError(err.message || "No se pudo crear la cuenta bancaria.");
    }
  };

  const toggleAccount = (account) => {
    if (account.isActive) {
      setPendingDeactivate(account);
      return;
    }
    handleSetActive(account.id, true);
  };

  const handleSetActive = async (id, isActive) => {
    try {
      await setActive(id, isActive);
      await refetch();
    } catch (err) {
      console.error("Error al cambiar el estado de la cuenta:", err);
    }
  };

  const confirmDeactivate = async () => {
    await handleSetActive(pendingDeactivate.id, false);
    setPendingDeactivate(null);
  };

  const isSaving = isCreating || isUploading;

  return (
    <div className="ba-page">
      <NavBarAdmin />

      <div className="ba-wrapper">
        <div className="ba-header">
          <div>
            <h1 className="ba-title">{t("bankAccounts.title")}</h1>
            <p className="ba-subtitle">{t("bankAccounts.subtitle")}</p>
          </div>
          <button className="ba-btn-add" onClick={() => setShowAddModal(true)}>
            <FiPlus /> {t("bankAccounts.btnAdd")}
          </button>
        </div>

        {isLoading && <p className="ba-integrity-notice">{t("bankAccounts.loading")}</p>}
        {!isLoading && error && <p className="ba-integrity-notice">{error}</p>}

        {!isLoading && !error && (
          <>
            <div className="ba-kpis">
              {kpis.map(({ key, label, value, icon: Icon, tone }) => (
                <div className="ba-kpi" key={key}>
                  <div>
                    <p className="ba-kpi-label">{label}</p>
                    <p className={`ba-kpi-value ${tone || ""}`}>{value}</p>
                  </div>
                  <Icon className={`ba-kpi-icon ${tone || ""}`} />
                </div>
              ))}
            </div>

            <div className="ba-grid">
              {accounts.map((a) => (
                <div key={a.id} className={`ba-card ${a.isActive ? "" : "inactive"}`}>
                  <div className="ba-card-top">
                    <span className={`ba-badge ${a.isActive ? "active" : "inactive"}`}>
                      {a.isActive ? t("bankAccounts.badgeActive") : t("bankAccounts.badgeInactive")}
                    </span>
                    <label className="ba-switch">
                      <input
                        type="checkbox"
                        checked={a.isActive}
                        onChange={() => toggleAccount(a)}
                        disabled={isToggling}
                      />
                      <span className="ba-switch-track"><span className="ba-switch-thumb" /></span>
                    </label>
                  </div>

                  <div className="ba-card-qr">
                    {a.qrImageUrl ? <img src={a.qrImageUrl} alt={a.bankName} /> : <span className="ba-qr-placeholder">QR</span>}
                  </div>

                  <div className="ba-card-info">
                    <h3>{a.bankName}</h3>
                    <p className="ba-card-holder">{a.holderName}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ba-integrity-notice">
          <FiInfo />
          <p><strong>{t("bankAccounts.integrityTitle")}</strong> {t("bankAccounts.integrityText")}</p>
        </div>
      </div>

      <FooterAdmin />

      {showAddModal && (
        <div className="ba-modal-overlay" onClick={closeAddModal}>
          <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ba-modal-header">
              <h3>{t("bankAccounts.modal.title")}</h3>
              <button type="button" className="ba-modal-close" onClick={closeAddModal} aria-label={t("bankAccounts.modal.close")}>
                <FiX />
              </button>
            </div>

            <form id="createAccountForm" className="ba-modal-form" onSubmit={handleCreate}>
              <label className="ba-field">
                {t("bankAccounts.modal.bankName")}
                <input name="bankName" type="text" required placeholder={t("bankAccounts.modal.bankNamePlaceholder")} />
              </label>

              <label className="ba-field">
                {t("bankAccounts.modal.holderName")}
                <input name="holderName" type="text" required placeholder={t("bankAccounts.modal.holderNamePlaceholder")} />
              </label>

              <div className="ba-field">
                {t("bankAccounts.modal.qr")}
                <QrDropzone onFileChange={handleQrChange} error={qrError} t={t} />
                {qrError && <p className="ba-error-message">{t("bankAccounts.modal.qrRequired")}</p>}
              </div>

              {formError && <p className="ba-error-message">{formError}</p>}
            </form>

            <div className="ba-modal-footer">
              <button type="button" className="ba-btn-secondary" onClick={closeAddModal} disabled={isSaving}>
                {t("bankAccounts.modal.cancel")}
              </button>
              <button type="submit" form="createAccountForm" className="ba-btn-primary" disabled={isSaving}>
                {isSaving ? "Guardando..." : t("bankAccounts.modal.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDeactivate && (
        <div className="ba-modal-overlay" onClick={() => setPendingDeactivate(null)}>
          <div className="ba-modal ba-modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="ba-confirm-body">
              <FiAlertTriangle className="ba-confirm-icon" />
              <div>
                <h3>{t("bankAccounts.confirm.title")}</h3>
                <p className="ba-confirm-account">{pendingDeactivate.bankName}</p>
                <p className="ba-confirm-text">{t("bankAccounts.confirm.text")}</p>
              </div>
            </div>
            <div className="ba-modal-footer">
              <button className="ba-btn-secondary" onClick={() => setPendingDeactivate(null)}>
                {t("bankAccounts.confirm.cancel")}
              </button>
              <button className="ba-btn-danger" onClick={confirmDeactivate} disabled={isToggling}>
                {isToggling ? "..." : t("bankAccounts.confirm.accept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}