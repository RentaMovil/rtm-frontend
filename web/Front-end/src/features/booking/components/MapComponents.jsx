import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents
} from "react-leaflet";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

const defaultMarkerIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const selectedMarkerIcon = L.divIcon({
    className: "selected-branch-marker",
    html: "<span></span>",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

function MapFocus({ selectedBranch }) {
    const map = useMap();
    useEffect(() => {
        if (
            selectedBranch &&
            Number.isFinite(Number(selectedBranch.latitude)) &&
            Number.isFinite(Number(selectedBranch.longitude))
        ) {
            map.flyTo([Number(selectedBranch.latitude), Number(selectedBranch.longitude)], 14, { duration: 0.6 });
        }
    }, [map, selectedBranch]);
    return null;
}

function ClickToPick({ onPick }) {
    useMapEvents({
        click(e) {
            onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

function MapComponent({
    mode = "view",
    branch,
    branches = [],
    selectedBranch,
    setSelectedBranch,
    pickedLat,
    pickedLng,
    onPick,
}) {
    const { t } = useTranslation();

    const isValidCoordinates = (location) => {
        // null también se descarta: Number(null) es 0 y la sucursal saldría en el punto (0, 0)
        return (
            location &&
            location.latitude != null &&
            location.longitude != null &&
            Number.isFinite(Number(location.latitude)) &&
            Number.isFinite(Number(location.longitude))
        );
    };

    let center = null;

    if (mode === "view" && isValidCoordinates(branch)) {
        center = [Number(branch.latitude), Number(branch.longitude)];
    }

    if (mode === "select" && isValidCoordinates(selectedBranch)) {
        center = [Number(selectedBranch.latitude), Number(selectedBranch.longitude)];
    }

    if (mode === "select" && !center && isValidCoordinates(branches[0])) {
        center = [Number(branches[0].latitude), Number(branches[0].longitude)];
    }

    // mode="pick" sigue usando pickedLat/pickedLng — son props de estado local del formulario,
    // no vienen de la API, así que su nombre no tiene que coincidir con el resto
    if (mode === "pick" && Number.isFinite(Number(pickedLat)) && Number.isFinite(Number(pickedLng))) {
        center = [Number(pickedLat), Number(pickedLng)];
    }

    if (!center) {
        return (
            <div style={{
                height: "250px", width: "100%", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#f5f5f5"
            }}>
                {t("common.noLocationAvailable")}
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={mode === "pick" ? 15 : 13}
            style={{ height: "250px", width: "100%", borderRadius: "10px" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mode === "select" && <MapFocus selectedBranch={selectedBranch} />}
            {mode === "pick" && <ClickToPick onPick={onPick} />}

            {mode === "view" && isValidCoordinates(branch) && (
                <Marker position={[Number(branch.latitude), Number(branch.longitude)]} icon={defaultMarkerIcon}>
                    <Popup><strong>{branch.name}</strong><br />{branch.address}</Popup>
                </Marker>
            )}

            {mode === "select" &&
                branches.filter(isValidCoordinates).map((b) => (
                    <Marker
                        key={b.id}
                        position={[Number(b.latitude), Number(b.longitude)]}
                        icon={b.id === selectedBranch?.id ? selectedMarkerIcon : defaultMarkerIcon}
                        zIndexOffset={b.id === selectedBranch?.id ? 1000 : 0}
                        eventHandlers={{ click: () => setSelectedBranch?.(b) }}
                    >
                        <Popup><strong>{b.name}</strong><br />{b.address}</Popup>
                    </Marker>
                ))}

            {mode === "pick" && (
                <Marker position={center} icon={defaultMarkerIcon} />
            )}
        </MapContainer>
    );
}

export default MapComponent;