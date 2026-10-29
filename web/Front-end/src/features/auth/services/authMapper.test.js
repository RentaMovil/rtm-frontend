import { describe, expect, it } from "vitest";
import { toLoginPayload, toRegisterPayload, toAuthUserViewModel } from "./authMapper";

describe("toLoginPayload", () => {
  it("normaliza el email a minúsculas y sin espacios", () => {
    expect(toLoginPayload({ email: "  Thiago@Mail.com ", password: "secret" })).toEqual({
      identifier: "thiago@mail.com",
      password: "secret",
    });
  });
});

describe("toRegisterPayload", () => {
  it("mapea los campos del formulario y envía null si no hay teléfono", () => {
    expect(
      toRegisterPayload({
        first_name: " Nicole ",
        last_name: " Ramírez ",
        email: " Nicole@Mail.com ",
        phone: "  ",
        username: "nicolerv",
        password: "secret",
      }),
    ).toEqual({
      firstName: "Nicole",
      lastName: "Ramírez",
      email: "nicole@mail.com",
      phone: null,
      username: "nicolerv",
      password: "secret",
    });
  });

  it("conserva el teléfono cuando viene con valor", () => {
    expect(
      toRegisterPayload({
        first_name: "David",
        last_name: "Erez",
        email: "david@mail.com",
        phone: "3001234567",
        username: "davide",
        password: "secret",
      }).phone,
    ).toBe("3001234567");
  });
});

describe("toAuthUserViewModel", () => {
  it("acepta tanto la respuesta envuelta en 'user' como el objeto plano", () => {
    const wrapped = toAuthUserViewModel({ user: { id: 1, email: "a@a.com", role: "admin" } });
    const flat = toAuthUserViewModel({ id: 1, email: "a@a.com", role: "admin" });

    expect(wrapped).toEqual(flat);
  });

  it("usa CLIENT y ACTIVE por defecto, y pone role/status en mayúsculas", () => {
    const viewModel = toAuthUserViewModel({ id: 5, email: "cliente@mail.com" });

    expect(viewModel.role).toBe("CLIENT");
    expect(viewModel.status).toBe("ACTIVE");
  });
});
