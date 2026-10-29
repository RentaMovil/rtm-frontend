// `file.type` lo deriva el navegador de la extensión del archivo, no de su contenido real:
// renombrar un .exe a foto.jpg hace que el navegador lo reporte como "image/jpeg" igual.
// Esto lee los primeros bytes reales del archivo y los compara contra la firma binaria
// (magic bytes) conocida de cada formato, independiente de cómo se llame o qué diga `file.type`.

// https://en.wikipedia.org/wiki/List_of_file_signatures
const SIGNATURES = [
    { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
    { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
    { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
    // WEBP: "RIFF" + 4 bytes de tamaño + "WEBP" -> se revisan los dos tramos por separado
    { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, extra: { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 } },
];

function matchesBytes(header, { bytes, offset = 0 }) {
    return bytes.every((byte, i) => header[offset + i] === byte);
}

// Lee solo los primeros bytes necesarios (16 alcanza para todas las firmas de arriba),
// no el archivo completo.
function readHeader(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file.slice(0, 16));
    });
}

/**
 * Verifica que el contenido real del archivo corresponda a uno de los formatos permitidos,
 * sin confiar en `file.type` ni en la extensión del nombre.
 *
 * @param {File} file
 * @param {string[]} allowedMimes - subconjunto de los formatos que soporta SIGNATURES
 * @returns {Promise<boolean>}
 */
export async function hasValidFileSignature(file, allowedMimes) {
    const header = await readHeader(file);

    return SIGNATURES
        .filter((sig) => allowedMimes.includes(sig.mime))
        .some((sig) => matchesBytes(header, sig) && (!sig.extra || matchesBytes(header, sig.extra)));
}
