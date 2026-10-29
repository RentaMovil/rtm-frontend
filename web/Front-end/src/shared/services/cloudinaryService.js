import { hasValidFileSignature } from '../utils/fileSignature.js';

// Cuenta de Cloudinary del proyecto. El cloud name y el preset sin firma no son secretos: viajan
// en la peticion desde el navegador. El api_secret no va aqui: lo usara payment-billing en el
// servidor para subir las facturas.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dz6ohgjub';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'dav32erzro';

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Tope del preset sin firma
const MAX_BYTES = 10 * 1024 * 1024;

// El PDF entra por /image/upload igual que las imagenes y la URL queda en .../image/upload/...,
// que es la que necesita el comprobante de pago: iam ya valida ese prefijo para la foto de perfil
// (app.iam.profile-image.allowed-prefix) y payment-billing hara lo mismo con el comprobante.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export const cloudinaryService = {
    async uploadImage(file) {
        // Se revisa antes de subir: Cloudinary devuelve el error en ingles y sin traducir
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Formato no admitido: usa JPG, PNG, WEBP, GIF o PDF');
        }
        if (file.size > MAX_BYTES) {
            throw new Error('El archivo supera los 10 MB');
        }
        // file.type lo deriva el navegador de la extensión, no del contenido real: esto chequea
        // los magic bytes para que no baste con renombrar cualquier archivo a ".jpg".
        if (!(await hasValidFileSignature(file, ALLOWED_TYPES))) {
            throw new Error('El archivo no es una imagen o PDF válido');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
        if (!res.ok) {
            const detalle = await res.json().catch(() => null);
            throw new Error(detalle?.error?.message || 'Error subiendo imagen a Cloudinary');
        }

        const data = await res.json();
        // secure_url y no url: iam rechaza la URL si no empieza por el prefijo https
        return data.secure_url;
    },
};
