import { Platform } from "react-native";

/**
 * Sube la foto de perfil a Cloudinary y devuelve la URL subida.
 *
 * `PATCH /users/me` (rtm-iam) valida que `imageUrl` empiece con el prefijo
 * de nuestra cuenta de Cloudinary (`APP_IAM_PROFILE_IMAGE_ALLOWED_PREFIX`);
 * una URI local (`file://...`) no pasa esa validacion, asi que la foto se
 * sube antes de guardar el perfil, igual que el comprobante de pago
 * (`paymentReceiptService.ts`), con su propio preset/cloud (misma cuenta).
 */
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dz6ohgjub";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dav32erzro";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForMimeType(mimeType: string): string {
    switch (mimeType) {
        case "image/png":
            return "png";
        case "image/webp":
            return "webp";
        default:
            return "jpg";
    }
}

export async function uploadProfileImage(uri: string): Promise<string> {
    const mimeType = "image/jpeg";
    const fileName = `profile-photo.${extensionForMimeType(mimeType)}`;

    const formData = new FormData();
    formData.append("upload_preset", UPLOAD_PRESET);

    if (Platform.OS === "web") {
        const fileResponse = await fetch(uri);
        if (!fileResponse.ok) {
            throw new Error("No se pudo leer la foto seleccionada.");
        }

        const blob = await fileResponse.blob();
        if (!ALLOWED_TYPES.has(blob.type) && blob.type) {
            throw new Error("Formato no admitido: usa JPG, PNG o WEBP.");
        }
        if (blob.size > MAX_BYTES) {
            throw new Error("La foto supera el límite de 5 MB.");
        }
        formData.append("file", blob, fileName);
    } else {
        formData.append("file", { uri, name: fileName, type: mimeType } as unknown as Blob);
    }

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
    );

    const result = (await response.json().catch(() => null)) as
        | { secure_url?: string; error?: { message?: string } }
        | null;

    if (!response.ok || !result?.secure_url) {
        throw new Error(result?.error?.message || "No se pudo subir la foto de perfil.");
    }

    return result.secure_url;
}
