import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";

import {
    ActivityIndicator,
    Modal,
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

import { ApiError } from "../../../shared/api/httpClient";
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
        changeEmail,
    } = useAuth();

    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Cambio de correo: vive en su propio modal, no en el modo edicion del
    // perfil (la confirmacion es la contrasena actual, no un guardado mas).
    // Sigue el mismo flujo que el web: sin paso de verificacion por codigo.
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);

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


    // Arranca con la foto real del usuario (si ya subio una) en vez de
    // forzar siempre el placeholder: antes `image` solo se llenaba cuando el
    // usuario elegia una nueva foto en la sesion actual, asi que la foto ya
    // guardada en el backend (GET /users/me -> imageUrl) nunca se mostraba.
    const [
        image,
        setImage,
    ] =
        useState<string | null>(user?.imageUrl ?? null);


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
        setImage(user.imageUrl ?? null);
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


    function openEmailModal() {
        setNewEmail("");
        setEmailPassword("");
        setEmailError(null);
        setEmailSuccess(false);
        setShowEmailModal(true);
    }


    function closeEmailModal() {
        // A mitad de la peticion el modal se queda abierto: cerrarlo dejaria
        // al usuario sin saber si el cambio se aplico.
        if (isChangingEmail) return;

        setShowEmailModal(false);
    }


    function validateNewEmail(correo: string): string | null {
        if (!correo) {
            return "El correo nuevo es obligatorio.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return "Ingresa un correo válido.";
        }

        if (correo.toLowerCase() === (user?.email ?? "").toLowerCase()) {
            return "El correo nuevo debe ser distinto al actual.";
        }

        if (!emailPassword) {
            return "Ingresa tu contraseña actual para confirmar el cambio.";
        }

        return null;
    }


    async function handleChangeEmail() {
        const correo = newEmail.trim();
        const problem = validateNewEmail(correo);

        if (problem) {
            setEmailError(problem);
            return;
        }

        setEmailError(null);
        setIsChangingEmail(true);

        try {
            await changeEmail(correo, emailPassword);

            setShowEmailModal(false);
            setNewEmail("");
            setEmailPassword("");
            setEmailSuccess(true);
        } catch (err) {
            // Contraseña incorrecta, correo ya registrado o backend caido: se
            // muestra el mensaje real del servidor, nunca se afirma que el
            // cambio se completo si la peticion fallo.
            setEmailError(
                err instanceof ApiError || err instanceof Error
                    ? err.message
                    : "No se pudo cambiar el correo.",
            );
        } finally {
            setIsChangingEmail(false);
        }
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

                        Usuario

                    </Text>


                    <TextInput

                        style={styles.input}

                        value={
                            user?.username ?? ""
                        }

                        editable={false}

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


                {/* CAMBIAR CORREO */}

                <TouchableOpacity

                    style={styles.emailActionButton}

                    onPress={openEmailModal}

                >

                    <Text style={styles.emailActionText}>

                        Cambiar correo

                    </Text>

                </TouchableOpacity>


                {emailSuccess ? (
                    <Text style={[styles.label, { color: colors.success, marginBottom: 16 }]}>
                        Correo actualizado correctamente.
                    </Text>
                ) : null}


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


            {/* MODAL CAMBIAR CORREO */}

            <Modal
                visible={showEmailModal}
                animationType="fade"
                transparent
                onRequestClose={closeEmailModal}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>
                            Cambiar correo
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Correo actual</Text>
                            <TextInput
                                style={styles.input}
                                value={user?.email ?? ""}
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Correo nuevo</Text>
                            <TextInput
                                style={[styles.input, styles.inputEditing]}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                editable={!isChangingEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="nuevo@correo.com"
                                placeholderTextColor={colors.secondaryText}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Contraseña actual</Text>
                            <TextInput
                                style={[styles.input, styles.inputEditing]}
                                value={emailPassword}
                                onChangeText={setEmailPassword}
                                editable={!isChangingEmail}
                                secureTextEntry
                                autoCapitalize="none"
                                placeholder="Tu contraseña"
                                placeholderTextColor={colors.secondaryText}
                            />
                        </View>

                        {emailError ? (
                            <Text style={styles.modalError}>{emailError}</Text>
                        ) : null}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={closeEmailModal}
                                disabled={isChangingEmail}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalConfirmButton,
                                    isChangingEmail && styles.modalConfirmButtonDisabled,
                                ]}
                                onPress={handleChangeEmail}
                                disabled={isChangingEmail}
                            >
                                {isChangingEmail ? (
                                    <ActivityIndicator color={colors.buttonText} />
                                ) : (
                                    <Text style={styles.modalConfirmText}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                    </View>

                </View>

            </Modal>

        </ScrollView>

    );

}
