import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import login from "../../../assets/login.png";
import { useImageUpload } from "../../../shared/hooks/useImageUpload";

const EMPTY = "—";

// Campos editables. El correo NO se incluye a proposito: cambiarlo es una
// operacion aparte (pide la contraseña) y no un guardado de perfil.
// El username tampoco: iam no permite cambiarlo.
const CAMPOS = [
    { key: "firstName", etiqueta: "account.nombre", tipo: "text" },
    { key: "lastName", etiqueta: "account.apellido", tipo: "text" },
    { key: "phone", etiqueta: "account.telefono", tipo: "tel" },
];

export default function ProfileIdentity({
    user,
    isEditing = false,
    onSave,
    isSaving = false,
    onChangeEmail,
}) {
    const { t } = useTranslation();
    const { uploadImage, isUploading } = useImageUpload();
    const [uploadError, setUploadError] = useState("");

    // El borrador vive aqui, no en el padre, porque es el componente que tiene
    // los inputs. Se reinicia cada vez que se entra o se sale del modo edicion,
    // para no dejar cambios a medias si se cancela.
    const [borrador, setBorrador] = useState({});

    useEffect(() => {
        if (!isEditing) {
            setBorrador({});
            return;
        }
        setBorrador({
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            phone: user?.phone ?? "",
            imageUrl: user?.imageUrl ?? "",
        });
    }, [isEditing, user]);

    if (!user) {
        return null;
    }

    const valor = (key) => (isEditing ? (borrador[key] ?? "") : user[key] || EMPTY);

    // La foto se sube a Cloudinary apenas se elige; a iam solo va la URL al guardar
    const elegirFoto = async (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;
        setUploadError("");
        try {
            const url = await uploadImage(archivo);
            setBorrador((b) => ({ ...b, imageUrl: url }));
        } catch (err) {
            // El servicio ya avisa si el formato o el tamano no sirven; eso se muestra tal cual
            setUploadError(err.message || "No se pudo subir la foto. Intenta de nuevo.");
        }
    };

    const guardar = () => {
        // Solo se manda lo que cambio de verdad. Si no hay nada, el padre cierra
        // el modo edicion sin llamar a la API.
        const cambios = {};
        for (const c of CAMPOS) {
            const nuevo = (borrador[c.key] ?? "").trim();
            const antes = user[c.key] ?? "";
            // Nombre y apellido no pueden quedar vacios; el telefono si (vacio = borrarlo)
            if (nuevo !== antes && (nuevo || c.key === "phone")) {
                cambios[c.key] = nuevo;
            }
        }
        if ((borrador.imageUrl ?? "") !== (user.imageUrl ?? "")) {
            cambios.imageUrl = borrador.imageUrl;
        }

        onSave?.(cambios);
    };

    const foto = (isEditing ? borrador.imageUrl : user.imageUrl) || login;

    return (
        <>
            <div className="form-image">
                <label className="form-image-preview">
                    <img
                        className="imgPerfile"
                        src={foto}
                        alt={t("account.profileImage")}
                    />
                    {isEditing && (
                        <>
                            <p className="edit editingText">
                                {isUploading ? t("account.guardando") : t("account.cambiarFoto")}
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={elegirFoto}
                                disabled={isUploading}
                                style={{ display: "none" }}
                            />
                        </>
                    )}
                </label>
                {uploadError && <p className="account-error" role="alert">{uploadError}</p>}
            </div>

            {CAMPOS.map((campo) => (
                <div className="form-groupC" key={campo.key}>
                    <label className="form-labelC" htmlFor={`profile-${campo.key}`}>
                        {t(campo.etiqueta)}:
                    </label>
                    <input
                        id={`profile-${campo.key}`}
                        className="inputC"
                        type={campo.tipo}
                        value={valor(campo.key)}
                        onChange={
                            isEditing
                                ? (e) =>
                                    setBorrador((b) => ({ ...b, [campo.key]: e.target.value }))
                                : undefined
                        }
                        readOnly={!isEditing}
                    />
                </div>
            ))}

            {/* El username se muestra pero nunca se edita */}
            <div className="form-groupC">
                <label className="form-labelC" htmlFor="profile-username">
                    {t("account.usuario")}:
                </label>
                <input
                    id="profile-username"
                    className="inputC inputC--locked"
                    type="text"
                    value={user.username || EMPTY}
                    readOnly
                    title={t("account.usernameLocked")}
                />
            </div>

            <div className="form-groupC">
                <label className="form-labelC" htmlFor="profile-email">
                    {t("account.correo")}:
                </label>
                <input
                    id="profile-email"
                    className="inputC"
                    type="email"
                    value={user.email || EMPTY}
                    readOnly
                />

                {/* El correo no entra en el modo edicion del perfil: cambiarlo
                    es otra operacion (HU-IAM-004) que exige reintroducir la
                    contrasena actual, asi que se abre en su propio modal. */}
                <button type="button" className="linkC ce-open" onClick={onChangeEmail}>
                    {t("changeEmail.open")}
                </button>
            </div>

            <div className="form-groupC">
                <label className="form-labelC" htmlFor="profile-password">
                    {t("account.password")}:
                </label>
                <input
                    id="profile-password"
                    className="inputC"
                    type="password"
                    value="••••••"
                    readOnly
                />
                <div className="accountLink">
                    <Link to="/ChangePassword" className="linkC">
                        {t("account.modificarPassword")}
                    </Link>
                </div>
            </div>

            {/* Boton de guardar. Solo en modo edicion. */}
            {isEditing && (
                <div className="form-groupC">
                    <button
                        className="btn-saveProfile"
                        type="button"
                        onClick={guardar}
                        disabled={isSaving || isUploading}
                    >
                        {isSaving ? t("account.guardando") : t("account.guardar")}
                    </button>
                </div>
            )}
        </>
    );
}
