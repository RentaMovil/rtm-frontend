import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";

import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
} from "react-native";

import { themes } from "../../../theme/themes";
import { useTheme } from "../../../theme/useTheme";
import { CountStyles } from "./Account.styles";

import SelectLanguage from "../../../shared/components/Select/SelectLanguage";
import ThemeSelector from "../../../shared/components/Select/SelectTheme";
import AppCard from "../../../shared/components/AppCard/AppCard";

import { useAuth } from "../../auth/context/AuthContext";
import { uploadProfileImage } from "../services/profileImageService";


const defaultUser =
    require("@/assets/images/login.png");


export default function Account() {

    const router = useRouter();


    const {
        user,
        logout,
        refreshUser,
        updateProfile,
    } = useAuth();

    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Login/registro no traen el telefono (UserResponse no lo incluye); se
    // completa pidiendo el perfil completo (GET /users/me, con phone).
    useEffect(() => {
        refreshUser().catch(() => undefined);
    }, [refreshUser]);
    const {
        themeName,
    } = useTheme();


    const colors =
        themes[themeName];


    const styles =
        CountStyles(colors);


    const [
        editing,
        setEditing,
    ] =
        useState(false);


    const [
        image,
        setImage,
    ] =
        useState<string | null>(null);


    const [
        showSettings,
        setShowSettings,
    ] =
        useState(false);


    const [
        name,
        setName,
    ] =
        useState(
            user
                ? `${user.firstName} ${user.lastName}`
                : ""
        );


    const [
        phone,
        setPhone,
    ] =
        useState(
            user?.phone ?? ""
        );

    // `user` llega primero sin phone (login/registro) y luego se completa con
    // refreshUser() (GET /users/me). Sincroniza los campos cuando eso pasa,
    // pero no mientras el usuario esta editando (no le pisa lo que escribio).
    useEffect(() => {
        if (!user || editing) return;

        setName(`${user.firstName} ${user.lastName}`);
        setPhone(user.phone ?? "");
    }, [user, editing]);


    const pickImage =
        async () => {

            const result =
                await ImagePicker.launchImageLibraryAsync({

                    mediaTypes: ["images"],

                    allowsEditing: true,

                    aspect: [1, 1],

                    quality: 1,

                });


            if (!result.canceled) {

                setImage(
                    result.assets[0].uri
                );

            }

        };

    async function handleSave() {
        if (!user) return;

        setSaveError(null);
        setIsSaving(true);

        const [firstName, ...rest] = name.trim().split(" ");
        const lastName = rest.join(" ");

        try {
            // `image` es una URI local (expo-image-picker): PATCH /users/me
            // rechaza cualquier imageUrl que no empiece con el prefijo de
            // nuestra cuenta de Cloudinary, asi que se sube antes de guardar.
            const imageUrl = image ? await uploadProfileImage(image) : undefined;

            await updateProfile({
                firstName,
                lastName,
                phone,
                imageUrl,
            });

            setEditing(false);
        } catch (err) {
            setSaveError(
                err instanceof Error ? err.message : "No se pudo guardar el perfil.",
            );
        } finally {
            setIsSaving(false);
        }
    }


    async function handleLogout() {

        await logout();

        router.replace("/auth/login");

    }


    return (

        <ScrollView contentContainerStyle={styles.content}>

            {/* FOTO */}

            <View style={styles.profileHeader}>
                <View style={styles.photoContainer}>

                    <View style={styles.photoRing}>
                        <Image

                            source={
                                image
                                    ? { uri: image }
                                    : defaultUser
                            }

                            style={styles.image}

                        />
                    </View>


                    <TouchableOpacity

                        style={styles.selectButton}

                        onPress={pickImage}

                    >

                        <Text
                            style={
                                styles.selectButtonText
                            }
                        >

                            Cambiar foto

                        </Text>

                    </TouchableOpacity>

                </View>
                <Text style={styles.pageTitle}>{user ? `${user.firstName} ${user.lastName}` : "Mi cuenta"}</Text>
                <Text style={styles.pageSubtitle}>Gestiona tu información y preferencias.</Text>
            </View>


            {/* CONFIGURACIÓN */}

            <TouchableOpacity

                style={styles.settingsButton}

                onPress={() =>
                    setShowSettings(
                        !showSettings
                    )
                }

            >

                <View
                    style={styles.settingsLabel}
                >

                    <FontAwesome
                        name="cog"
                        size={16}
                        color={colors.primary}
                    />

                    <Text
                        style={styles.settingsTitle}
                    >

                        Configuración

                    </Text>

                </View>


                <Text
                    style={styles.arrow}
                >

                    {
                        showSettings
                            ? "▲"
                            : "▼"
                    }

                </Text>

            </TouchableOpacity>


            {
                showSettings && (

                    <AppCard style={styles.settingsCard}>

                        <View
                            style={
                                styles.settingItem
                            }
                        >

                            <Text
                                style={
                                    styles.settingLabel
                                }
                            >

                                Tema

                            </Text>


                            <ThemeSelector />

                        </View>


                        <View
                            style={
                                styles.settingItem
                            }
                        >

                            <SelectLanguage />

                        </View>

                    </AppCard>

                )
            }


            {/* INFORMACIÓN */}

            <AppCard>

                <Text
                    style={
                        styles.sectionTitle
                    }
                >

                    Información personal

                </Text>


                <View
                    style={
                        styles.inputContainer
                    }
                >

                    <Text
                        style={styles.label}
                    >

                        Nombre

                    </Text>


                    <TextInput

                        style={[styles.input, editing && styles.inputEditing]}

                        value={name}

                        editable={editing}

                        onChangeText={setName}

                    />

                </View>


                <View
                    style={
                        styles.inputContainer
                    }
                >

                    <Text
                        style={styles.label}
                    >

                        Teléfono

                    </Text>


                    <TextInput

                        style={[styles.input, editing && styles.inputEditing]}

                        value={phone}

                        editable={editing}

                        onChangeText={setPhone}

                    />

                </View>


                <View
                    style={
                        styles.inputContainer
                    }
                >

                    <Text
                        style={styles.label}
                    >

                        Correo

                    </Text>


                    <TextInput

                        style={styles.input}

                        value={
                            user?.email ?? ""
                        }

                        editable={false}

                    />

                </View>


                {/* CAMBIAR CONTRASEÑA */}

                <TouchableOpacity

                    style={
                        styles.passwordButton
                    }

                    onPress={() =>
                        router.push("/account/change-password")
                    }

                >

                    <Text
                        style={
                            styles.passwordText
                        }
                    >

                        Cambiar contraseña

                    </Text>

                </TouchableOpacity>

            </AppCard>


            {/* BOTONES */}

            <View
                style={
                    styles.buttonsRow
                }
            >

                <TouchableOpacity
                    style={styles.editButton}
                    disabled={isSaving}
                    onPress={() => {

                        if (editing) {

                            handleSave();

                        } else {

                            setEditing(true);

                        }

                    }}
                >
                    <Text style={styles.buttonEditar}>

                        {editing ? (isSaving ? "Guardando..." : "Guardar") : "Editar"}

                    </Text>
                </TouchableOpacity>


                <TouchableOpacity

                    style={
                        styles.outCesionButton
                    }

                    onPress={
                        handleLogout
                    }

                >

                    <Text
                        style={
                            styles.outCesionButtonText
                        }
                    >

                        Cerrar sesión

                    </Text>

                </TouchableOpacity>

            </View>

        </ScrollView>

    );

}
