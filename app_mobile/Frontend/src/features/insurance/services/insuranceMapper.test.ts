import { toInsuranceViewModel } from "./insuranceMapper";

describe("insuranceMapper", () => {
  it("maps the API insurance plan and applies the default tag", () => {
    expect(
      toInsuranceViewModel({
        id: 5,
        name: "Cobertura total",
        coverageDetails: "Protección contra daños y robo",
        dailyCost: "25000",
      }),
    ).toEqual({
      id: "5",
      name: "Cobertura total",
      description: "Protección contra daños y robo",
      price: 25000,
      tag: "base",
    });
  });

  it("preserves an API tag and defaults an invalid daily cost to zero", () => {
    expect(
      toInsuranceViewModel({
        id: "premium",
        name: "Premium",
        coverageDetails: "Cobertura premium",
        dailyCost: "invalid",
        tag: "popular",
      }),
    ).toMatchObject({ id: "premium", price: 0, tag: "popular" });
  });
});
