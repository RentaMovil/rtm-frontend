export function toGpsViewModel(gps) {
    return { id: gps.id, serial: gps.serial, model: gps.model, isActive: gps.active };
}