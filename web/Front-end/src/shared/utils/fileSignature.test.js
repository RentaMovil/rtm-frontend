import { describe, expect, it } from "vitest";

import { hasValidFileSignature } from "./fileSignature";

function fakeFile(bytes, { name = "file", type = "" } = {}) {
  return new File([new Uint8Array(bytes)], name, { type });
}

const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46];
const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PDF_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34];
const WEBP_HEADER = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];

describe("hasValidFileSignature", () => {
  it("acepta un JPEG real aunque lo llamen distinto", async () => {
    const file = fakeFile(JPEG_HEADER, { name: "comprobante" });
    expect(await hasValidFileSignature(file, ["image/jpeg", "application/pdf"])).toBe(true);
  });

  it("acepta un PDF real", async () => {
    const file = fakeFile(PDF_HEADER);
    expect(await hasValidFileSignature(file, ["image/jpeg", "application/pdf"])).toBe(true);
  });

  it("acepta un PNG y un WEBP reales", async () => {
    expect(await hasValidFileSignature(fakeFile(PNG_HEADER), ["image/png"])).toBe(true);
    expect(await hasValidFileSignature(fakeFile(WEBP_HEADER), ["image/webp"])).toBe(true);
  });

  it("rechaza un archivo renombrado a .jpg que en realidad es otra cosa (ej. un .exe)", async () => {
    const notActuallyAnImage = fakeFile([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00], {
      name: "foto.jpg",
      type: "image/jpeg", // el navegador lo cree una imagen por la extensión; el contenido no lo es
    });

    expect(await hasValidFileSignature(notActuallyAnImage, ["image/jpeg", "application/pdf"])).toBe(
      false,
    );
  });

  it("rechaza un formato real pero que no está en la lista permitida (ej. PDF donde solo se acepta imagen)", async () => {
    const file = fakeFile(PDF_HEADER);
    expect(await hasValidFileSignature(file, ["image/jpeg", "image/png"])).toBe(false);
  });
});
