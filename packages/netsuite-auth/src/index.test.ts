import { describe, it, expect } from "vitest";
import { NetSuiteAuth } from "./index.js";

describe("NetSuiteAuth", () => {
  it("should validate complete credentials config", () => {
    const auth = new NetSuiteAuth({
      accountId: "TST12345",
      consumerKey: "ckey",
      consumerSecret: "csecret",
      tokenId: "tkey",
      tokenSecret: "tsecret",
    });

    expect(auth.validate()).toBe(true);
  });

  it("should generate an OAuth authorization header string", () => {
    const auth = new NetSuiteAuth({
      accountId: "TST12345",
      consumerKey: "ckey",
      consumerSecret: "csecret",
      tokenId: "tkey",
      tokenSecret: "tsecret",
    });

    const header = auth.getAuthorizationHeader("GET", "https://example.com");
    expect(header).toContain("OAuth");
    expect(header).toContain('oauth_consumer_key="ckey"');
    expect(header).toContain('oauth_token="tkey"');
  });
});
