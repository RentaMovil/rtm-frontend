import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import {
    RENTAL_TERMS_VERSION,
    getRentalTermsEffectiveDate,
    getRentalTermsSections,
} from "../data/rentalTerms";

import "./TermsAndConditions.css";

function formatCurrency(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "—";
    }

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date =
        typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? new Date(`${value}T12:00:00`)
            : new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "—";
    }

    const hasTime = typeof value === "string" && /T\d{2}:\d{2}/.test(value);

    return new Intl.DateTimeFormat("es-CO", hasTime
        ? { dateStyle: "medium", timeStyle: "short" }
        : { dateStyle: "medium" }).format(date);
}

function branchName(branch) {
    return branch?.name ?? branch?.nombre ?? branch?.city ?? "—";
}

export default function TermsAndConditions({
    accepted,
    onAcceptChange,
    vehicle,
    pickupDate,
    returnDate,
    pickupBranch,
    returnBranch,
    total,
}) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const openerRef = useRef(null);
    const closeButtonRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();
    const dialogId = `${titleId}-dialog`;
    const rentalTermsSections = getRentalTermsSections(t);
    const RENTAL_TERMS_EFFECTIVE_DATE = getRentalTermsEffectiveDate(t);

    const openTerms = () => {
        setIsOpen(true);
    };

    const closeTerms = useCallback(() => {
        setIsOpen(false);
        openerRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const focusFrame = window.requestAnimationFrame(() => {
            closeButtonRef.current?.focus();
        });

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeTerms();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeTerms, isOpen]);

    return (
        <>
            <div className="terms-acceptance">
                <div className="terms-acceptance-control">
                    <input
                        id={`${titleId}-acceptance`}
                        className="terms-checkbox"
                        type="checkbox"
                        required
                        checked={accepted}
                        onChange={(event) =>
                            onAcceptChange(event.target.checked)
                        }
                        aria-describedby={`${titleId}-help`}
                    />
                    <div className="terms-acceptance-copy">
                        <label
                            htmlFor={`${titleId}-acceptance`}
                            className="terms-acceptance-label"
                        >
                            {t("terms.acceptLabel")}
                        </label>
                        <button
                            ref={openerRef}
                            type="button"
                            className="terms-link"
                            onClick={openTerms}
                            aria-haspopup="dialog"
                            aria-expanded={isOpen}
                            aria-controls={dialogId}
                        >
                            {t("terms.view")}
                        </button>
                    </div>
                </div>
                <p
                    id={`${titleId}-help`}
                    className="terms-acceptance-help"
                >
                    {t("terms.required")}
                </p>
            </div>

            {isOpen &&
                createPortal(
                    <div
                        className="terms-modal-overlay"
                        role="presentation"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeTerms();
                            }
                        }}
                    >
                        <section
                            id={dialogId}
                            className="terms-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={titleId}
                            aria-describedby={descriptionId}
                        >
                            <header className="terms-modal-header">
                                <div>
                                    <p className="terms-modal-eyebrow">
                                        {t("terms.documentLabel")}
                                    </p>
                                    <h2 id={titleId} className="terms-modal-title">
                                        {t("terms.title")}
                                    </h2>
                                    <p
                                        id={descriptionId}
                                        className="terms-modal-meta"
                                    >
                                        {t("terms.version")}:{" "}
                                        <strong>{RENTAL_TERMS_VERSION}</strong>
                                        {" · "}
                                        {t("terms.effectiveDate")}:{" "}
                                        <strong>
                                            {RENTAL_TERMS_EFFECTIVE_DATE}
                                        </strong>
                                    </p>
                                </div>
                                <button
                                    ref={closeButtonRef}
                                    type="button"
                                    className="terms-modal-close"
                                    onClick={closeTerms}
                                    aria-label={t("terms.close")}
                                >
                                    ×
                                </button>
                            </header>

                            <div className="terms-modal-body">
                                <div className="terms-summary">
                                    <p className="terms-summary-title">
                                        {t("terms.summary")}
                                    </p>
                                    <dl className="terms-summary-list">
                                        <div>
                                            <dt>{t("terms.vehicle")}</dt>
                                            <dd>{vehicle?.name ?? "—"}</dd>
                                        </div>
                                        <div>
                                            <dt>{t("terms.pickup")}</dt>
                                            <dd>
                                                {formatDate(pickupDate)}
                                                {" · "}
                                                {branchName(pickupBranch)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>{t("terms.return")}</dt>
                                            <dd>
                                                {formatDate(returnDate)}
                                                {" · "}
                                                {branchName(returnBranch)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>{t("terms.total")}</dt>
                                            <dd>{formatCurrency(total)}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <p className="terms-introduction">
                                    {t("terms.introduction")}
                                </p>

                                <div className="terms-sections">
                                    {rentalTermsSections.map((section) => (
                                        <article
                                            key={section.id}
                                            className="terms-section"
                                        >
                                            <h3>{section.title}</h3>
                                            {section.paragraphs.map(
                                                (paragraph) => (
                                                    <p key={paragraph}>
                                                        {paragraph}
                                                    </p>
                                                ),
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <footer className="terms-modal-footer">
                                <button
                                    type="button"
                                    className="terms-secondary-button"
                                    onClick={closeTerms}
                                >
                                    {t("terms.cancel")}
                                </button>
                                <button
                                    type="button"
                                    className="terms-primary-button"
                                    onClick={() => {
                                        onAcceptChange(true);
                                        closeTerms();
                                    }}
                                >
                                    {t("terms.accept")}
                                </button>
                            </footer>
                        </section>
                    </div>,
                    document.body,
                )}
        </>
    );
}
