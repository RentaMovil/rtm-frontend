import { fromApiVehicle, fromApiVehiclePage, type FleetVehicleDto } from "./vehicleMapper";

const vehicleDto: FleetVehicleDto = {
  id: 42,
  plate: "ABC123",
  model: {
    id: 7,
    name: "Corolla",
    brand: { id: 2, name: "Toyota" },
    category: { id: 3, name: "Sedan" },
    engineType: { id: 4, name: "Híbrido" },
  },
  capacity: 5,
  year: 2024,
  imageUrl: "https://example.com/car.jpg",
  status: "AVAILABLE",
  mileage: 1200,
  dailyPrice: 180000,
  branch: { id: 9, name: "Centro" },
};

describe("vehicleMapper", () => {
  it("maps the fleet vehicle DTO into the app vehicle model", () => {
    expect(fromApiVehicle(vehicleDto)).toEqual({
      id: "42",
      plate: "ABC123",
      brand: "Toyota",
      model: "Corolla",
      price: 180000,
      mileage: 1200,
      year: 2024,
      capacity: 5,
      vehicleType: "Sedan",
      fuelType: "Híbrido",
      location: "Centro",
      branchId: "9",
      image: "https://example.com/car.jpg",
      status: "AVAILABLE",
    });
  });

  it("uses empty image and location values when the API fields are null", () => {
    expect(fromApiVehicle({ ...vehicleDto, imageUrl: null, branch: null })).toMatchObject({
      location: "",
      branchId: undefined,
      image: "",
    });
  });

  it("maps every item in a paginated response", () => {
    expect(
      fromApiVehiclePage({
        items: [vehicleDto, { ...vehicleDto, id: 43 }],
        page: 0,
        limit: 20,
        total: 2,
        totalPages: 1,
      }).map(({ id }) => id),
    ).toEqual(["42", "43"]);
  });
});
