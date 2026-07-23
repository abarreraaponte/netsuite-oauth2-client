import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { NetSuiteClientCredentialsClient, type TokenData, type TokenStorage } from "./index.js";

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mock-jwt-token"),
  },
  sign: vi.fn(() => "mock-jwt-token"),
}));

describe("NetSuiteClientCredentialsClient", () => {
  let mockStorage: TokenStorage;
  let storedToken: TokenData | null = null;

  beforeEach(() => {
    storedToken = null;
    mockStorage = {
      getToken: vi.fn(async () => storedToken),
      saveToken: vi.fn(async (token: TokenData) => {
        storedToken = token;
      }),
    };
    vi.clearAllMocks();
  });

  it("should retrieve a token from storage if it exists and has not expired", async () => {
    storedToken = {
      accessToken: "valid-cached-token",
      expiresAt: Date.now() + 1000 * 60 * 10, // 10 minutes from now
    };

    const client = new NetSuiteClientCredentialsClient(
      {
        accountId: "123456-sb1",
        consumerKey: "ckey",
        consumerSecret: "csecret",
        certificateId: "cert-id",
        privateKey: "private-key",
      },
      mockStorage,
    );

    const token = await client.getCurrentToken();
    expect(token).toBe("valid-cached-token");
    expect(mockStorage.getToken).toHaveBeenCalledTimes(1);
    expect(mockStorage.saveToken).not.toHaveBeenCalled();
  });

  it("should fetch a new token, save it, and return it if storage is empty", async () => {
    const client = new NetSuiteClientCredentialsClient(
      {
        accountId: "123456-sb1",
        consumerKey: "ckey",
        consumerSecret: "csecret",
        certificateId: "cert-id",
        privateKey: "private-key",
      },
      mockStorage,
    );

    // Mock fetch globally
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ access_token: "newly-fetched-token" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const token = await client.getCurrentToken();
    expect(token).toBe("newly-fetched-token");
    expect(mockStorage.getToken).toHaveBeenCalledTimes(1);
    expect(mockStorage.saveToken).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "newly-fetched-token",
        expiresAt: expect.any(Number),
      }),
    );
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  it("should fetch a new token if storage token is expired", async () => {
    storedToken = {
      accessToken: "expired-token",
      expiresAt: Date.now() - 1000, // expired 1s ago
    };

    const client = new NetSuiteClientCredentialsClient(
      {
        accountId: "123456-sb1",
        consumerKey: "ckey",
        consumerSecret: "csecret",
        certificateId: "cert-id",
        privateKey: "private-key",
      },
      mockStorage,
    );

    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ access_token: "refreshed-token" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const token = await client.getCurrentToken();
    expect(token).toBe("refreshed-token");
    expect(mockStorage.getToken).toHaveBeenCalledTimes(1);
    expect(mockStorage.saveToken).toHaveBeenCalled();
  });

  it("should format accountId correctly replacing underscores with hyphens and converting to lowercase", async () => {
    const client = new NetSuiteClientCredentialsClient(
      {
        accountId: "123456_SB1",
        consumerKey: "ckey",
        consumerSecret: "csecret",
        certificateId: "cert-id",
        privateKey: "private-key",
      },
      mockStorage,
    );

    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ access_token: "newly-fetched-token" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await client.getCurrentToken();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://123456-sb1.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token",
      expect.any(Object),
    );
  });

  it("should use the configured signing algorithm in jwt.sign", async () => {
    const client = new NetSuiteClientCredentialsClient(
      {
        accountId: "123456-sb1",
        consumerKey: "ckey",
        consumerSecret: "csecret",
        certificateId: "cert-id",
        privateKey: "private-key",
        algorithm: "ES256",
      },
      mockStorage,
    );

    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ access_token: "newly-fetched-token" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await client.getCurrentToken();

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      "private-key",
      expect.objectContaining({
        algorithm: "ES256",
        header: expect.objectContaining({
          alg: "ES256",
        }),
      }),
    );
  });
});
