import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { createStyles } from "./FilterModal.styles";
import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";

export interface Filters {
  brand: string;
  model: string;
  category: string;
  fuelType: string;

  minPrice: number;
  maxPrice: number;
  search: string;
}

/**
 * Opciones disponibles para filtrar.
 *
 * Se reciben por props y no se derivan de un store global: asi este
 * componente de `shared` no depende de la feature `vehicles`. Quien lo
 * usa decide de que conjunto de vehiculos se extraen las opciones.
 */
export interface FilterOptions {
  readonly categories: readonly string[];
  readonly brands: readonly string[];
  readonly models: readonly string[];
  readonly fuelTypes: readonly string[];
}

interface Props {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly filters: Filters;
  readonly setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  readonly options: FilterOptions;
  readonly onApply: () => void;
  readonly onClear: () => void;
}

export default function FilterModal({
  visible,
  onClose,
  filters,
  setFilters,
  options,
  onApply,
  onClear,
}: Props) {
  const { themeName } = useTheme();
  const colors = themes[themeName as keyof typeof themes];
  const styles = createStyles(colors);

  const categories = options.categories;
  const brand = options.brands;
  const models = options.models;
  const fuelTypes = options.fuelTypes;

  /**
   * Fila de opcion con casilla real.
   *
   * Antes era un emoji de check dentro del texto ("✔️ Gasolina"), que hacia
   * de checkbox pero no lo era: no tenia area de pulsacion propia, no era
   * accesible y el emoji cambiaba de aspecto entre plataformas. Ahora la
   * casilla es un icono con su propio color de estado.
   */
  const renderOption = (
    item: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <FontAwesome
        name={selected ? "check-square" : "square-o"}
        size={17}
        color={selected ? colors.button : colors.secondaryText}
        style={styles.checkbox}
      />

      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const selectFuelType = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      fuelType: prev.fuelType === value ? "" : value,
    }));
  };

  const toggleModel = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      model: prev.model === value ? "" : value,
    }));
  };

  const toggleCategory = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === value ? "" : value,
    }));
  };

  const togglebrand = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      brand: prev.brand === value ? "" : value,
    }));
  };

  const updatePrice = (key: "minPrice" | "maxPrice", value: string) => {
    const num = value === "" ? 0 : Number(value);

    setFilters((prev) => ({
      ...prev,
      [key]: Number.isNaN(num) ? 0 : num,
    }));
  };

  const isValidPrice = filters.minPrice <= filters.maxPrice;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Filtros</Text>

              <TouchableOpacity onPress={onClose} accessibilityRole="button">
                <FontAwesome
                  name="times"
                  size={18}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Precio</Text>

                  <View style={styles.priceContainer}>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.label}>Mínimo</Text>

                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(filters.minPrice)}
                        onChangeText={(text) => updatePrice("minPrice", text)}
                      />
                    </View>

                    <Text style={styles.priceSeparator}>—</Text>

                    <View style={styles.priceInputContainer}>
                      <Text style={styles.label}>Máximo</Text>

                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(filters.maxPrice)}
                        onChangeText={(text) => updatePrice("maxPrice", text)}
                      />
                    </View>
                  </View>

                  {!isValidPrice && (
                    <Text style={styles.invalidPrice}>
                      El precio mínimo no puede ser mayor al máximo
                    </Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tipo de motor</Text>

                  {fuelTypes.map((item) =>
                    renderOption(item, filters.fuelType.includes(item), () =>
                      selectFuelType(item),
                    ),
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Marca</Text>

                  {brand.map((item) =>
                    renderOption(item, filters.brand.includes(item), () =>
                      togglebrand(item),
                    ),
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Modelo</Text>

                  {models.map((item) =>
                    renderOption(item, filters.model === item, () =>
                      toggleModel(item),
                    ),
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Categoría</Text>

                  {categories.map((item) =>
                    renderOption(item, filters.category === item, () =>
                      toggleCategory(item),
                    ),
                  )}
                </View>
              </ScrollView>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={onClear}
              >
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  !isValidPrice && { opacity: 0.5 },
                ]}
                disabled={!isValidPrice}
                onPress={onApply}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
