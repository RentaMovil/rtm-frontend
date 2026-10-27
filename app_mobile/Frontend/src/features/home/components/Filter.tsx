import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

    import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import { Branch } from "../../../types/branch";
import { filterStyles } from "./Filter.styles";
import FontAwesome from "@expo/vector-icons/FontAwesome";

    import { getBranches } from "../../branches/services/branchService";

    export type SearchData = {
    branch: Branch;
    startDate: Date;
    endDate: Date;
    };

    type Props = {
    onSearch: (data: SearchData) => void;
    };

    export default function FilterCalendar({ onSearch }: Props) {
    const { themeName } = useTheme();
    const colors = themes[themeName];
    const styles = filterStyles(colors);

    const today = new Date();
    const getTomorrow = () => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        return t;
    };
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

    const [startDate, setStartDate] = useState<Date>(today);
    const [endDate, setEndDate] = useState<Date>(getTomorrow());

    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);

    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);

    const [errorBranch, setErrorBranch] = useState("");
    const errorDate =
        endDate < startDate ? t("filterCalendar.endDateBeforeStart") : "";

    const [branchOptions, setBranchOptions] = useState<Branch[]>([]);

    useEffect(() => {
        let cancelled = false;

        getBranches().then((loaded) => {
        if (!cancelled) {
            setBranchOptions(loaded);
        }
        }).catch(() => {
        // Sin catalogo no hay sugerencias: o el usuario escribe el nombre
        // a mano (se resuelve en handleSubmit) o vera el mensaje de
        // sucursal invalida. Lo importante es no dejar la promesa sin
        // manejar.
        });

        return () => {
        cancelled = true;
        };
    }, []);

    const handleChange = (value: string) => {
        setQuery(value);
        setErrorBranch("");

        // El texto ya no corresponde a la sucursal elegida: se invalida la
        // seleccion para que no se pueda confirmar una sucursal que no es la
        // que esta escrita en el campo.
        if (selectedBranch && value !== selectedBranch.name) {
        setSelectedBranch(null);
        }

        if (!value.trim()) {
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        return;
        }

        const filtered = branchOptions.filter((branch) =>
        branch.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsSuggestionsOpen(true);
    };

    const handleSelect = (branch: Branch) => {
        setQuery(branch.name);
        setSelectedBranch(branch);
        setSuggestions([]);
        setErrorBranch("");
        // Se cierra el desplegable: al vaciar `suggestions` tras elegir una
        // sucursal valida no debe interpretarse como "sin resultados".
        setIsSuggestionsOpen(false);
    };

    const applyTime = (date: Date, time: Date | null): Date => {
        const result = new Date(date);
        if (time) {
        result.setHours(time.getHours(), time.getMinutes(), 0, 0);
        }
        return result;
    };

    const handleSubmit = () => {
        if (errorDate) return;

        // El usuario puede escribir el nombre completo sin tocar las
        // sugerencias: en ese caso `selectedBranch` queda en null y, antes
        // de este fix, la busqueda se rechazaba con "sucursal invalida"
        // aunque el texto correspondiera a una sucursal real. Si el texto
        // coincide con una opcion (sin distinguir mayusculas ni espacios),
        // se resuelve aqui.
        const branch =
            selectedBranch ??
            branchOptions.find(
                (option) =>
                    option.name.trim().toLowerCase() ===
                    query.trim().toLowerCase(),
            ) ??
            null;

        if (!branch) {
            setErrorBranch(t("filterCalendar.invalidBranch"));
            return;
        }

        const finalStartDate = applyTime(startDate, startTime);
        const finalEndDate = applyTime(endDate, endTime);

        onSearch({
            branch,
            startDate: finalStartDate,
            endDate: finalEndDate,
        });
    };

    const formatDate = (d: Date) => d.toLocaleDateString();
    
    const formatTime = (d: Date | null) => {
        const date = d ?? new Date();
        return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        });
    };

    return (
        <View style={styles.filter}>
        {/* BRANCH */}
        <View style={styles.fieldFull}>
            <Text style={styles.labelFilter}>
            {t("filterCalendar.branch")}
            </Text>

            <TextInput
            style={styles.inputContainer}
            placeholder={t("filterCalendar.deliveryLocationPlaceholder")}
            value={query}
            onChangeText={handleChange}
            />

            {errorBranch ? (
            <Text style={styles.error}>{errorBranch}</Text>
            ) : null}

            {isSuggestionsOpen && query.trim().length > 0 && suggestions.length === 0 && (
            <View style={styles.suggestions}>
                <Text style={styles.noSuggestions}>
                {t("filterCalendar.noBranchResults")}
                </Text>
            </View>
            )}

            {isSuggestionsOpen && suggestions.length > 0 && (
            <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                style={styles.suggestions}
                renderItem={({ item }) => {
                    const isSelected = selectedBranch?.id === item.id;

                    return (
                    <TouchableOpacity
                        style={[
                            styles.suggestion,
                            isSelected && styles.suggestionSelected,
                        ]}
                        onPress={() => handleSelect(item)}
                    >
                        <View style={styles.suggestionIcon}>
                            <FontAwesome
                                name="map-marker"
                                size={15}
                                color={colors.primary}
                            />
                        </View>

                        <View style={styles.suggestionText}>
                            <Text style={styles.suggestionName}>
                            {item.name}
                            </Text>

                            <Text style={styles.suggestionAddress}>
                            {item.address}
                            </Text>

                            <View style={styles.suggestionCity}>
                                <Text style={styles.suggestionCityText}>
                                {item.city.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    );
                }}
            />
            )}
        </View>

        {/* DATES & TIMES */}
        <View style={styles.row}>
            {/* Start Date */}
            <View style={styles.field}>
            <Text style={styles.labelFilter}>
                {t("filterCalendar.deliveryDate")}
            </Text>
            <TouchableOpacity
                style={styles.inputButton}
                onPress={() => setShowStartDate(true)}
            >
                <Text style={styles.inputButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            {showStartDate && (
                <DateTimePicker
                value={startDate}
                mode="date"
                onChange={(_, d) => {
                    setShowStartDate(false);
                    if (d) setStartDate(d);
                }}
                />
            )}
            </View>

            {/* Start Time */}
            <View style={styles.field}>
            <Text style={styles.labelFilter}>
                {t("filterCalendar.deliveryHour")}
            </Text>
            <TouchableOpacity
                style={styles.inputButton}
                onPress={() => setShowStartTime(true)}
            >
                <Text style={styles.inputButtonText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>

            {showStartTime && (
                <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                onChange={(_, d) => {
                    setShowStartTime(false);
                    if (d) setStartTime(d);
                }}
                />
            )}
            </View>
        </View>

        {/* RETURN */}
        <View style={styles.row}>
            {/* End Date */}
            <View style={styles.field}>
            <Text style={styles.labelFilter}>
                {t("filterCalendar.returnDate")}
            </Text>
            <TouchableOpacity
                style={styles.inputButton}
                onPress={() => setShowEndDate(true)}
            >
                <Text style={styles.inputButtonText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>

            {showEndDate && (
                <DateTimePicker
                value={endDate}
                mode="date"
                minimumDate={startDate}
                onChange={(_, d) => {
                    setShowEndDate(false);
                    if (d) setEndDate(d);
                }}
                />
            )}
            </View>

            {/* End Time */}
            <View style={styles.field}>
            <Text style={styles.labelFilter}>
                {t("filterCalendar.returnHour")}
            </Text>
            <TouchableOpacity
                style={styles.inputButton}
                onPress={() => setShowEndTime(true)}
            >
                <Text style={styles.inputButtonText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>

            {showEndTime && (
                <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                onChange={(_, d) => {
                    setShowEndTime(false);
                    if (d) setEndTime(d);
                }}
                />
            )}
            </View>
        </View>

        {errorDate ? <Text style={styles.error}>{errorDate}</Text> : null}

        {/* BUTTON */}
        <TouchableOpacity style={styles.btnSearch} onPress={handleSubmit}>
            <Text style={styles.btnSearchText}>
            {t("filterCalendar.search")}
            </Text>
        </TouchableOpacity>
        </View>
    );
    }
