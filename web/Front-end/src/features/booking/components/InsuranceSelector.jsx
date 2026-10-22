import "./InsureanceSelector.css";
import { useTranslation } from "react-i18next";
import { FaCheck, FaShieldAlt } from "react-icons/fa";

import { useReservation } from "../context/ReservationContext";
import { useInsurance } from "../../admin/insuranceTypes/hooks/useInsurance";

export default function InsuranceSelector() {
  const { t } = useTranslation();
  const { reservation, updateInsurance } = useReservation();
  const selectedInsurance = reservation?.insuranceId ?? null;
  const { insurance, isLoading, error } = useInsurance();

  return (
    <section className="insurance-selector" aria-labelledby="insurance-title">
      <div className="insurance-header">
        <span className="insurance-header-icon" aria-hidden="true">
          <FaShieldAlt />
        </span>

        <div>
          <h3 id="insurance-title" className="insurance-title">{t("insuranceTypes.selectorTitle")}</h3>
          <p className="insurance-subtitle">
            {t("insuranceTypes.selectorSubtitle")}
          </p>
        </div>
      </div>

      {isLoading && <p className="insurance-subtitle">{t("insuranceTypes.loading")}</p>}
      {!isLoading && error && <p className="insurance-subtitle">{error}</p>}

      {!isLoading && !error && (
        <div className="insurance-options" role="radiogroup" aria-label={t("insuranceTypes.selectorAriaLabel")}>
          {insurance.map((option) => {
            const selected = selectedInsurance === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`insurance-option ${selected ? "insurance-option-selected" : ""}`}
                onClick={() => updateInsurance(option.id)}
              >
                <div className="insurance-info">
                  <h4 className="insurance-name">{option.name}</h4>
                  <p className="insurance-description">{option.description}</p>
                </div>

                <span className="insurance-price">
                  ${Number(option.price).toLocaleString("es-CO")}
                </span>

                <span className={`insurance-radio ${selected ? "insurance-radio-selected" : ""}`} aria-hidden="true">
                  {selected && <span className="insurance-radio-dot"><FaCheck /></span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}