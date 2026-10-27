import { toBranchViewModel } from "./branchMapper";

describe("branchMapper", () => {
  it("converts the API id to a string and preserves branch fields", () => {
    expect(
      toBranchViewModel({
        id: 12,
        name: "Norte",
        address: "Calle 10 # 20-30",
        city: "Bogotá",
        phone: "3001234567",
        latitude: 4.711,
        longitude: -74.0721,
      }),
    ).toEqual({
      id: "12",
      name: "Norte",
      address: "Calle 10 # 20-30",
      city: "Bogotá",
      phone: "3001234567",
      latitude: 4.711,
      longitude: -74.0721,
    });
  });

  it("normalizes missing coordinates to null", () => {
    expect(
      toBranchViewModel({
        id: "13",
        name: "Sur",
        address: "Carrera 1",
        city: "Cali",
        phone: "3000000000",
      }),
    ).toMatchObject({ id: "13", latitude: null, longitude: null });
  });
});
