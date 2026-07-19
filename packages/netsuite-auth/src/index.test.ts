import { describe, it, expect, vi, beforeEach } from "vitest";
import { sign } from "jsonwebtoken";
import {
  NetSuiteTBAClient,
  NetSuiteAuthClient,
  type TokenData,
  type TokenStorage,
} from "./index.js";

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
  sign: vi.fn(() => "mock-jwt-token"),
}));

describe("NetSuiteTBAClient", () => {
  it("should generate OAuth 1.0a authorization header with HMAC-SHA256 signature", () => {
    const client = new NetSuiteTBAClient({
      accountId: "123456-sb1",
      consumerKey: "ckey",
      consumerSecret: "csecret",
      tokenId: "tkey",
      tokenSecret: "tsecret",
    });

    const header = client.getAuthorizationHeader(
      "GET",
      "https://123456-sb1.restlets.api.netsuite.com/services/restlet/custom/script",
    );

    expect(header).toContain('OAuth realm="123456_SB1"');
    expect(header).toContain('oauth_consumer_key="ckey"');
    expect(header).toContain('oauth_token="tkey"');
    expect(header).toContain('oauth_signature_method="HMAC-SHA256"');
    expect(header).toContain("oauth_signature=");
    expect(header).toContain("oauth_nonce=");
    expect(header).toContain("oauth_timestamp=");
  });
});

describe("NetSuiteAuthClient", () => {
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

    const client = new NetSuiteAuthClient(
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
    const client = new NetSuiteAuthClient(
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
    expect(sign).toHaveBeenCalledTimes(1);
  });

  it("should fetch a new token if storage token is expired", async () => {
    storedToken = {
      accessToken: "expired-token",
      expiresAt: Date.now() - 1000, // expired 1s ago
    };

    const client = new NetSuiteAuthClient(
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
});
