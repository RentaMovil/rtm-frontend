    import React from "react";
    import "./VehicleReservationCard.css";
    import {
    FiUser,
    FiBriefcase,
    FiWind,
    FiDisc,
    FiCheck
    } from "react-icons/fi";

    export default function VehicleReservationCard({ vehicle }) {
    if (!vehicle) return null;

    const {
        img,
        name,
        branch,
        model,
        type,
        door,
        capacity,
        beneficios = [],
    } = vehicle;

    // Creamos los tags dinámicamente con sus respectivos íconos
    const features = [
        capacity ? { icon: <FiUser />, label: capacity } : null,
        door ? { icon: <FiBriefcase />, label: door } : null,
        { icon: <FiWind />, label: "A/C" }, // Opcional según tu data
        type ? { icon: <FiDisc />, label: type } : null,
        model ? { icon: null, label: `Modelo: ${model}` } : null,
    ].filter(Boolean);

    return (
        <div className="reservation-vehicle-card">
        
        {/* COLUMNA IZQUIERDA: Imagen y Badges */}
        <div className="reservation-vehicle-left">
            <div className="reservation-vehicle-image-wrap">
            <img className="reservation-vehicle-image" src={img} alt={name} />
            </div>
        </div>

        {/* COLUMNA DERECHA: Información, Features e Inclusiones */}
        <div className="reservation-vehicle-content">
            <div className="reservation-vehicle-header">
            <div>
                <h2 className="reservation-vehicle-title">{name}</h2>
                {type && <p className="reservation-vehicle-subtitle">o {type} similar</p>}
            </div>
            </div>

            {/* Tags / Pills con Íconos */}
            <div className="reservation-vehicle-meta">
            {features.map((feature) => (
                <span key={feature.label} className="reservation-vehicle-pill">
                {feature.icon && <span className="pill-icon">{feature.icon}</span>}
                {feature.label}
                </span>
            ))}
            </div>

            <div className="reservation-vehicle-badges">
            <span className="reservation-badge-score">✈️</span>
            {branch?.name && (
                <span className="reservation-badge-brand">{branch.name}</span>
            )}
            </div>

        </div>

        </div>
    );
    }