export function toLocationViewModel(location) {
    return {
        id: location.id,
        gpsId: location.gpsId,
        latitude: location.latitude,
        longitude: location.longitude,
        recordedAt: location.timestamp,
    };
}