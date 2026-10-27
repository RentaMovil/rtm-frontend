import { API_ROUTES, API_URL } from "../../config/env";
import { httpClient } from "./httpClient";
import { tokenStore } from "./tokenStore";

jest.mock("./tokenStore", () => ({
  tokenStore: {
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clearAll: jest.fn(),
    triggerRefreshFail: jest.fn(),
  },
}));

const mockedTokenStore = jest.mocked(tokenStore);
const fetchMock = jest.fn();
const originalFetch = global.fetch;
let currentAccessToken = "expired-access-token";

function response(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("httpClient", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;

    currentAccessToken = "expired-access-token";
    mockedTokenStore.getAccessToken.mockReset().mockImplementation(() => currentAccessToken);
    mockedTokenStore.setAccessToken.mockReset().mockImplementation((token) => {
      currentAccessToken = token;
    });
    mockedTokenStore.getRefreshToken.mockReset().mockResolvedValue("old-refresh-token");
    mockedTokenStore.setRefreshToken.mockReset().mockResolvedValue(undefined);
    mockedTokenStore.clearAll.mockReset().mockResolvedValue(undefined);
    mockedTokenStore.triggerRefreshFail.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("refreshes after 401, stores rotated tokens, and retries the original request", async () => {
    fetchMock
      .mockResolvedValueOnce(response(401, { message: "Access token expired" }))
      .mockResolvedValueOnce(
        response(200, {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        }),
      )
      .mockResolvedValueOnce(response(200, { id: 123 }));

    await expect(httpClient.get("/vehicles/123")).resolves.toEqual({ id: 123 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${API_URL}/vehicles/123`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer expired-access-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${API_URL}${API_ROUTES.auth.refresh}`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refreshToken: "old-refresh-token" }),
      }),
    );
    expect(mockedTokenStore.setAccessToken).toHaveBeenCalledWith("new-access-token");
    expect(mockedTokenStore.setRefreshToken).toHaveBeenCalledWith("new-refresh-token");
    expect(fetchMock.mock.calls[2][1].headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer new-access-token" }),
    );
  });

  it("returns null for a 204 response without trying to parse a body", async () => {
    const noContent = response(204);
    fetchMock.mockResolvedValueOnce(noContent);

    await expect(httpClient.delete("/reservations/123")).resolves.toBeNull();
    expect(noContent.json).not.toHaveBeenCalled();
  });

  it("shares one refresh when concurrent requests receive 401", async () => {
    let refreshCalls = 0;
    fetchMock.mockImplementation(async (url: string) => {
      if (url === `${API_URL}${API_ROUTES.auth.refresh}`) {
        refreshCalls += 1;
        await Promise.resolve();
        return response(200, {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        });
      }

      if (url.endsWith("/vehicles/1") || url.endsWith("/vehicles/2")) {
        const currentCalls = fetchMock.mock.calls.filter(([callUrl]) => callUrl === url).length;
        return currentCalls === 1
          ? response(401, { message: "Access token expired" })
          : response(200, { id: Number(url.slice(-1)) });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    const [first, second] = await Promise.all([
      httpClient.get<{ id: number }>("/vehicles/1"),
      httpClient.get<{ id: number }>("/vehicles/2"),
    ]);

    expect(first).toEqual({ id: 1 });
    expect(second).toEqual({ id: 2 });
    expect(refreshCalls).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(mockedTokenStore.getRefreshToken).toHaveBeenCalledTimes(1);
  });

  it.each([
    API_ROUTES.auth.forgotPassword,
    API_ROUTES.auth.verifyEmail,
    API_ROUTES.auth.resendEmailVerification,
  ])("does not refresh a 401 from public auth route %s", async (endpoint) => {
    fetchMock.mockResolvedValueOnce(response(401, { message: "Invalid request" }));

    await expect(httpClient.post(endpoint, {})).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}${endpoint}`,
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockedTokenStore.getRefreshToken).not.toHaveBeenCalled();
  });
});
