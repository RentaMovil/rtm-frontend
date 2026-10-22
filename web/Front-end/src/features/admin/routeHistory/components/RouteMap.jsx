import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultMarkerIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const startIcon = L.divIcon({
    className: "rh-route-marker",
    html: '<span class="rh-route-dot rh-route-dot--start"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const endIcon = L.divIcon({
    className: "rh-route-marker",
    html: '<span class="rh-route-dot rh-route-dot--end"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

/** Centra y ajusta el zoom para que toda la ruta entre en pantalla. */
function FitRoute({ points }) {
    const map = useMap();

    useEffect(() => {
        if (!points.length) return;
        if (points.length === 1) {
            map.flyTo([points[0].latitude, points[0].longitude], 14, { duration: 0.6 });
            return;
        }
        const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
        map.flyToBounds(bounds, { padding: [32, 32], duration: 0.6 });
        // points.length alcanza como key: una ruta nueva casi siempre trae una cantidad
        // distinta de puntos, y si no cambia tampoco hace falta volver a encuadrar.
    }, [map, points.length]);

    return null;
}

/**
 * Mapa del recorrido: la polyline que conecta los puntos reportados en la ventana de
 * fecha/hora elegida, con un marcador de inicio y otro de fin.
 *
 * @param {Array}  points Puntos ordenados por fecha ascendente ({ latitude, longitude, recordedAt }).
 * @param {string} label  Nombre del vehículo para los popups.
 */
export default function RouteMap({ points, label }) {
    const center = points.length
        ? [points[0].latitude, points[0].longitude]
        : [4.6097, -74.0817];

    const path = points.map((p) => [p.latitude, p.longitude]);
    const start = points[0];
    const end = points.length > 1 ? points[points.length - 1] : null;

    return (
        <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {path.length > 1 && (
                <Polyline positions={path} pathOptions={{ color: "#C59B27", weight: 4, opacity: 0.85 }} />
            )}

            {start && (
                <Marker position={[start.latitude, start.longitude]} icon={end ? startIcon : defaultMarkerIcon}>
                    <Popup>
                        <strong>{label}</strong>
                        <br />
                        {start.recordedAt}
                    </Popup>
                </Marker>
            )}

            {end && (
                <Marker position={[end.latitude, end.longitude]} icon={endIcon}>
                    <Popup>
                        <strong>{label}</strong>
                        <br />
                        {end.recordedAt}
                    </Popup>
                </Marker>
            )}

            <FitRoute points={points} />
        </MapContainer>
    );
}
