import { Platform } from "react-native";

import type { PaymentReceiptFile } from "../../../types";

const CLOUD_NAME =
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dz6ohgjub";
const UPLOAD_PRESET =
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dav32erzro";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
]);

function extensionForMimeType(mimeType: string): string {
    switch (mimeType) {
        case "image/png":
            return "png";
        case "image/webp":
            return "webp";
        case "image/gif":
            return "gif";
        case "application/pdf":
            return "pdf";
        default:
            return "jpg";
    }
}

export async function uploadPaymentReceipt(
    file: PaymentReceiptFile,
): Promise<string> {
    const mimeType = file.mimeType || "image/jpeg";
    const fileName =
        file.fileName || `payment-receipt.${extensionForMimeType(mimeType)}`;

    if (!ALLOWED_TYPES.has(mimeType)) {
        throw new Error("Formato no admitido: usa JPG, PNG, WEBP, GIF o PDF.");
    }

    if (file.fileSize != null && file.fileSize > MAX_BYTES) {
        throw new Error("El comprobante supera el límite de 10 MB.");
    }

    const formData = new FormData();
    formData.append("upload_preset", UPLOAD_PRESET);

    if (Platform.OS === "web") {
        const fileResponse = await fetch(file.uri);
        if (!fileResponse.ok) {
            throw new Error("No se pudo leer el archivo del comprobante.");
        }

        const blob = await fileResponse.blob();
        if (blob.size > MAX_BYTES) {
            throw new Error("El comprobante supera el límite de 10 MB.");
        }
        formData.append("file", blob, fileName);
    } else {
        formData.append(
            "file",
            { uri: file.uri, name: fileName, type: mimeType } as unknown as Blob,
        );
    }

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
    );

    const result = (await response.json().catch(() => null)) as
        | { secure_url?: string; error?: { message?: string } }
        | null;

    if (!response.ok || !result?.secure_url) {
        throw new Error(
            result?.error?.message || "No se pudo subir el comprobante.",
        );
    }

    return result.secure_url;
}