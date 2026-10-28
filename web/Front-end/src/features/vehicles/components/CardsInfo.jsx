// src/components/ProcessSteps.jsx
import React, { useState, useEffect } from 'react';
import { PROCESS_STEPS_MOCK } from '../constans/processSteps';
import './CardsInfo.style.css';
import { useBranches } from '../../admin/branches/hooks/useBranch';// ajusta la ruta real
import { useTranslation } from "react-i18next";
import { FaCar, FaCheck, FaFile, FaMapMarked, FaMapMarkedAlt, FaShieldAlt } from 'react-icons/fa';
import { Fa1, FaLocationDot, FaShield } from 'react-icons/fa6';
import MapComponent from '../../booking/components/MapComponents';

export const ProcessSteps = () => {
    const { t } = useTranslation();
    const { branches, isLoading, error } = useBranches();
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Selecciona la primera sucursal apenas llegan del servidor
    useEffect(() => {
        if (branches.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0]);
        }
    }, [branches, selectedBranch]);

    return (
        <section className="process-section">
            <div className="process-container">

                <div className="process-header">
                    <h2 className="process-title">{t('process.title')}</h2>
                    <p className="process-subtitle">{t('process.subtitle')}</p>
                </div>

                <div className="steps-grid">
                    {PROCESS_STEPS_MOCK.map((step) => {
                        const Icon = step.iconComponent;
                        return (
                            <div key={step.id} className="step-card">
                                <div className="icon-container">
                                    <Icon className="step-icon" />
                                </div>
                                <h3 className="card-title">{t(step.titleKey)}</h3>
                                <p className="card-description">{t(step.descriptionKey)}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="card-driver">
                    <div className="information">
                        <h3 className="card-title"> {t('requirements.title')}</h3>
                        <div className="card-features-list">
                            <div className="feature-item">
                                <div className="item-card">
                                    <div className='cardinfo-container'>
                                        <div className='column-r'><FaMapMarkedAlt className='cardId-icon' /></div>
                                        <div className='column-l'>
                                            <strong className="item-title">{t('requirements.branches')}: </strong>
                                            <span className="item-description">{t('requirements.branchesDescription')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="feature-item1">
                                <div className="item-card">
                                    <div className='cardinfo-container'>
                                        <div className='column-r'><FaShieldAlt className='cardId-icon' /></div>
                                        <div className='column-l'>
                                            <strong className="item-title">{t('requirements.insurance')}: </strong>
                                            <span className="item-description">{t('requirements.insuranceDescription')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="feature-item1">
                                <div className="item-card">
                                    <div className='cardinfo-container'>
                                        <div className='column-r'><FaCheck className='cardId-icon' /></div>
                                        <div className='column-l'>
                                            <strong className="item-title">{t('requirements.securePayment')}: </strong>
                                            <span className="item-description">{t('requirements.securePaymentDescription')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="information">
                        <div className='sub'>
                            <h3 className="card-title">{t('title.rentamovil')}</h3>
                        </div>

                        <p className='driver-description'>{t('description.info-branches')}</p>

                        {isLoading && <p>{t("branches.loading")}</p>}
                        {!isLoading && error && <p>{error}</p>}

                        {!isLoading && !error && (
                            <>
                                <div className="branches-cards">
                                    {branches.map((branch) => (
                                        <div
                                            key={branch.id}
                                            className={`cards-branches${selectedBranch?.id === branch.id ? ' is-selected' : ''}`}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={selectedBranch?.id === branch.id}
                                            onClick={() => setSelectedBranch(branch)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    setSelectedBranch(branch);
                                                }
                                            }}
                                        >
                                            <FaLocationDot className='branches-icon' />
                                            {branch.name}
                                            <div>{branch.address}</div>
                                        </div>
                                    ))}
                                </div>

                                {selectedBranch?.latitude != null && selectedBranch?.longitude != null && (
                                    <div className="branches-map" aria-label={t("branches.mapAriaLabel")}>
                                        <MapComponent
                                            mode="select"
                                            branches={branches.filter(b => b.latitude != null && b.longitude != null)}
                                            selectedBranch={selectedBranch}
                                            setSelectedBranch={setSelectedBranch}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessSteps;