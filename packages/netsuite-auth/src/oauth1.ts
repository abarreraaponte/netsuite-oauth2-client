import { createHmac, randomBytes } from "node:crypto";

/**
 * Configuration options for the NetSuite Token-Based Authentication (TBA) client.
 */
export interface NetSuiteTBAConfig {
  /** The NetSuite Account ID (e.g., "123456" or "123456_SB1"). */
  accountId: string;
  /** The Integration Consumer Key generated in NetSuite. */
  consumerKey: string;
  /** The Integration Consumer Secret generated in NetSuite. */
  consumerSecret: string;
  /** The Token ID generated for a specific user role. */
  tokenId: string;
  /** The Token Secret generated for a specific user role. */
  tokenSecret: string;
}

/**
 * NetSuite Token-Based Authentication (TBA) Client.
 * Implements the OAuth 1.0a HMAC-SHA256 protocol required by NetSuite RESTlets and REST Web Services.
 */
export class NetSuiteTBAClient {
  private config: NetSuiteTBAConfig;

  /**
   * Creates a new NetSuite TBA authentication client.
   * @param config The Token-Based Authentication configuration.
   */
  constructor(config: NetSuiteTBAConfig) {
    this.config = config;
  }

  /**
   * Generates a fully formatted OAuth 1.0a Authorization header.
   *
   * @param method The HTTP method of the request (e.g., "GET", "POST").
   * @param url The full URL destination of the NetSuite endpoint.
   * @returns The complete OAuth header string suitable for the `Authorization` header.
   */
  public getAuthorizationHeader(method: string, url: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = randomBytes(11).toString("hex");

    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;

    const params = new URLSearchParams(urlObj.search);
    params.append("oauth_consumer_key", this.config.consumerKey);
    params.append("oauth_nonce", nonce);
    params.append("oauth_signature_method", "HMAC-SHA256");
    params.append("oauth_timestamp", timestamp);
    params.append("oauth_token", this.config.tokenId);
    params.append("oauth_version", "1.0");

    const sortedParams = Array.from(params.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");

    const baseString = `${method.toUpperCase()}&${encodeURIComponent(baseUrl)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(this.config.consumerSecret)}&${encodeURIComponent(this.config.tokenSecret)}`;

    const signature = createHmac("sha256", signingKey).update(baseString).digest("base64");

    const realm = this.config.accountId.replace(/-/g, "_").toUpperCase();

    return `OAuth realm="${realm}",oauth_consumer_key="${this.config.consumerKey}",oauth_token="${this.config.tokenId}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${encodeURIComponent(signature)}"`;
  }
}
