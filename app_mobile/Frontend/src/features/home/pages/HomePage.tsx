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
import { formatDateOnly } from "../../vehicles/utils/formatDateOnly";
import VehicleCard from "../components/VehicleCard";


import { Vehicle } from "../../../types/vehicle";
import { useReservation } from "../../reservation/context/ReservationContext";

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const hasSearched = searchData !==null;
  const [emptyMessage, setEmptyMessage] = useState(
    "Primero debe realizar una búsqueda."
  );

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
    let cancelled = false;

    vehicleService.getVehicles().then((all) => {
      if (cancelled) {
        return;
      }

      setFilterOptions({
        categories: [...new Set(all.map((v) => v.vehicleType))],
        brands: [...new Set(all.map((v) => v.brand))],
        models: [...new Set(all.map((v) => v.model))],
        fuelTypes: [...new Set(all.map((v) => v.fuelType))],
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = async (currentSearchData: SearchData | null, currentFilters: Filters) => {
    if (!currentSearchData) {
      setVehicles([]);
      setEmptyMessage("Primero debe realizar una búsqueda.");
      return;
    }

    setEmptyMessage("");

    const byGenericFilters = await vehicleService.getVehicles({
      ...currentFilters,
    });

    // Sucursal elegida en el buscador: por branchId si la API lo dio, y por
    // nombre como respaldo (location es el unico dato que trae el mock).
    const byBranch = byGenericFilters.filter((vehicle) =>
      vehicle.branchId
        ? vehicle.branchId === currentSearchData.branch.id
        : vehicle.location === currentSearchData.branch.name,
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
      setEmptyMessage("No hay vehículos disponibles para los filtros seleccionados.");
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

    setEmptyMessage("Primero debe realizar una búsqueda.");
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
