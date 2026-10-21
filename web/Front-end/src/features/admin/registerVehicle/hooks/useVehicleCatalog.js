import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fleetCatalogService } from '../../../../shared/services/fleetCatalogService';

// Marcas y modelos de fleet-maintenance para el formulario de vehículos. Cada modelo ya trae su
// marca, categoría y tipo de motor (ver 06-data/models.md -> vehicle_model).
export function useVehicleCatalog() {
    const { t } = useTranslation();
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fleetCatalogService.getBrands(), fleetCatalogService.getVehicleModels()])
            .then(([brandsResponse, modelsResponse]) => {
                setBrands(brandsResponse);
                setModels(modelsResponse);
            })
            .catch((err) => setError(err.message || t('vehicleForm.catalogError')));
    }, []);

    return { brands, models, error };
}
