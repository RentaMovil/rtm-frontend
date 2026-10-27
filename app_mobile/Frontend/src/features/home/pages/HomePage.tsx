import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import { HomeStyles } from "./Home.styles";

import FilterModal, {
  FilterOptions,
  Filters,
} from "../../../shared/components/Filter/FilterModal";
import FilterCalendar, { SearchData } from "../components/Filter";
import ProcessSteps from "../components/ProcessSteps";

import { vehicleService } from "../../vehicles/services/vehicleService";
import { isAbortError } from "../../../shared/api/httpClient";
import { formatDateOnly } from "../../vehicles/utils/formatDateOnly";
import VehicleCard from "../components/VehicleCard";


import { Vehicle } from "../../../types/vehicle";
import { useReservation } from "../../reservation/context/ReservationContext";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const hasSearched = searchData !==null;
  const [emptyMessage, setEmptyMessage] = useState(t("home.searchFirst"));

  const [filters, setFilters] = useState<Filters>({
    brand: "",
    model: "",
    category: "",
    fuelType: "",
    minPrice: 0,
    maxPrice: 1000000,
    search: "",
  });

  const { createReservation } = useReservation();

  // El catalogo completo se carga una sola vez: las opciones del modal de
  // filtros deben ofrecer todos los valores, no solo los que ya survived
  // a los filtros activos.
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    brands: [],
    models: [],
    fuelTypes: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    vehicleService.getVehicles(undefined, { signal: controller.signal })
      .then((all) => {
        setFilterOptions({
          categories: [...new Set(all.map((v) => v.vehicleType))],
          brands: [...new Set(all.map((v) => v.brand))],
          models: [...new Set(all.map((v) => v.model))],
          fuelTypes: [...new Set(all.map((v) => v.fuelType))],
        });
      })
      .catch((error) => {
        if (!isAbortError(error)) console.error("No se pudieron cargar los filtros de vehículos.", error);
      });

    return () => controller.abort();
  }, []);

  const runSearch = async (currentSearchData: SearchData | null, currentFilters: Filters) => {
    if (!currentSearchData) {
      setVehicles([]);
      setEmptyMessage(t("home.searchFirst"));
      return;
    }

    setEmptyMessage("");

    const byGenericFilters = await vehicleService.getVehicles({
      ...currentFilters,
    });

    // Sucursal elegida en el buscador: por branchId si la API lo dio, y por
    // nombre como respaldo (no todos los vehiculos traen branchId). El
    // nombre se compara sin distinguir mayusculas ni espacios, porque el
    // campo permite escribirlo a mano y "Aeropuerto Norte " debia encontrar
    // lo mismo que la opcion elegida de las sugerencias.
    const branchName = currentSearchData.branch.name.trim().toLowerCase();
    const byBranch = byGenericFilters.filter((vehicle) =>
      vehicle.branchId
        ? vehicle.branchId === currentSearchData.branch.id
        : vehicle.location?.trim().toLowerCase() === branchName,
    );

    // Un vehiculo puede estar AVAILABLE y aun asi tener otra reserva que se
    // cruce con estas fechas (GET /vehicles/{id}/availability lo revisa
    // contra booking-reservation, no solo el estado del vehiculo). Sin este
    // filtro, "Alquilar" fallaba con 409 en vehiculos que el catalogo
    // mostraba como si estuvieran libres.
    const from = formatDateOnly(currentSearchData.startDate);
    const to = formatDateOnly(currentSearchData.endDate);

    const availabilityChecks = await Promise.all(
      byBranch.map(async (vehicle) => {
        try {
          const available = await vehicleService.getAvailability(vehicle.id, from, to);
          return available ? vehicle : null;
        } catch {
          // Si la verificacion falla no se oculta el vehiculo: el backend
          // vuelve a validar al crear la reserva y es quien decide (409).
          return vehicle;
        }
      }),
    );

    const filteredVehicles = availabilityChecks.filter(
      (vehicle): vehicle is Vehicle => vehicle !== null,
    );

    setVehicles(filteredVehicles);

    if (filteredVehicles.length === 0) {
      setEmptyMessage(t("home.noResults"));
    } else {
      setEmptyMessage("");
    }
  };

  const handleSearch = async (data: SearchData) => {
    setSearchData(data);
    await runSearch(data, filters);
  };

  const handleApplyFilters = async () => {
    setShowFilters(false);
    await runSearch(searchData, filters);
  };

  const handleClearFilters = async () => {
    const reset: Filters = {
      brand: "",
      model: "",
      category: "",
      fuelType: "",
      minPrice: 0,
      maxPrice: 1000000,
      search: "",
    };

    setFilters(reset);

    if (searchData) {
      await runSearch(searchData, reset);
      return;
    }

    setVehicles([]);
    setShowFilters(true);

    setEmptyMessage(t("home.searchFirst"));
  };

  const handleContinue = (vehicle: Vehicle) => {
    if (!searchData) {
      return;
    }

    createReservation(
      vehicle,
      searchData.branch,
      searchData.branch,
      searchData.startDate,
      searchData.endDate
    );

    router.push("/reservation");
  };

  const { themeName } = useTheme();
  const colors = themes[themeName as keyof typeof themes];
  const styles = HomeStyles(colors);

  return (
    <>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VehicleCard vehicle={item} onContinue={handleContinue} />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyMessage}</Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            <FilterCalendar onSearch={handleSearch} />

            {/*
              Los 4 pasos, como en el web (`Home.jsx` los pinta con
              `!hasSearchedCars`). Antes de buscar explican el proceso; en
              cuanto hay resultados estorban, asi que se retiran.
            */}
            {!hasSearched && <ProcessSteps />}

            {hasSearched && (
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              style={{
                marginTop: 10,
                padding: 12,
                backgroundColor: "#d9d8d8",
                borderRadius: 10,
                marginBottom :10,
              }}
            >
              <Text>Filtrar vehículos</Text>
            </TouchableOpacity>
            )}
          </View>
        }
      />

      { hasSearched && (
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />)}
    </>
  );
}
