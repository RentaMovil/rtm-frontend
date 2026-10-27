jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

type SecureStoreMock = {
  getItemAsync: jest.Mock;
  setItemAsync: jest.Mock;
  deleteItemAsync: jest.Mock;
};

type AsyncStorageMock = {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
};

describe("tokenStore", () => {
  let tokenStore: typeof import("./tokenStore").tokenStore;
  let secureStore: SecureStoreMock;
  let asyncStorage: AsyncStorageMock;

  beforeEach(() => {
    jest.resetModules();
    secureStore = jest.requireMock("expo-secure-store") as SecureStoreMock;
    asyncStorage = (
      jest.requireMock("@react-native-async-storage/async-storage") as {
        default: AsyncStorageMock;
      }
    ).default;

    secureStore.getItemAsync.mockResolvedValue(null);
    secureStore.setItemAsync.mockResolvedValue(undefined);
    secureStore.deleteItemAsync.mockResolvedValue(undefined);
    asyncStorage.getItem.mockResolvedValue(null);
    asyncStorage.setItem.mockResolvedValue(undefined);
    asyncStorage.removeItem.mockResolvedValue(undefined);

    // Re-import after resetting modules so each test gets a fresh sticky SecureStore state.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ tokenStore } = require("./tokenStore") as typeof import("./tokenStore"));
  });

  it("keeps the access token in memory and clears it", () => {
    expect(tokenStore.getAccessToken()).toBeNull();

    tokenStore.setAccessToken("access-token");
    expect(tokenStore.getAccessToken()).toBe("access-token");

    tokenStore.clear();
    expect(tokenStore.getAccessToken()).toBeNull();
  });

  it("reads and writes the refresh token with SecureStore", async () => {
    secureStore.getItemAsync.mockResolvedValue("refresh-token");

    await tokenStore.setRefreshToken("refresh-token");

    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      "rentamovil_refresh_token",
      "refresh-token",
    );
    await expect(tokenStore.getRefreshToken()).resolves.toBe("refresh-token");
    expect(tokenStore.isUsingSecureStore()).toBe(true);
    expect(asyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("falls back to AsyncStorage after SecureStore read fails", async () => {
    secureStore.getItemAsync.mockRejectedValue(new Error("SecureStore unavailable"));
    asyncStorage.getItem.mockResolvedValue("fallback-token");

    await expect(tokenStore.getRefreshToken()).resolves.toBe("fallback-token");
    await expect(tokenStore.getRefreshToken()).resolves.toBe("fallback-token");

    expect(tokenStore.isUsingSecureStore()).toBe(false);
    expect(secureStore.getItemAsync).toHaveBeenCalledTimes(1);
    expect(asyncStorage.getItem).toHaveBeenCalledTimes(2);
  });

  it("falls back to AsyncStorage after SecureStore write fails", async () => {
    secureStore.setItemAsync.mockRejectedValue(new Error("Keystore unavailable"));

    await tokenStore.setRefreshToken("refresh-token");

    expect(tokenStore.isUsingSecureStore()).toBe(false);
    expect(asyncStorage.setItem).toHaveBeenCalledWith("rentamovil_refresh_token", "refresh-token");
  });

  it("clears the in-memory token and both refresh-token stores", async () => {
    tokenStore.setAccessToken("access-token");
    secureStore.deleteItemAsync.mockRejectedValue(new Error("SecureStore unavailable"));
    asyncStorage.removeItem.mockRejectedValue(new Error("AsyncStorage unavailable"));

    await expect(tokenStore.clearAll()).resolves.toBeUndefined();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith("rentamovil_refresh_token");
    expect(asyncStorage.removeItem).toHaveBeenCalledWith("rentamovil_refresh_token");
  });

  it("notifies the registered refresh-failure callback", () => {
    const onRefreshFail = jest.fn();
    tokenStore.setOnRefreshFail(onRefreshFail);

    tokenStore.triggerRefreshFail();

    expect(onRefreshFail).toHaveBeenCalledTimes(1);
  });
});
