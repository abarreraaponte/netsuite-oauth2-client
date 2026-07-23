import jwt from "jsonwebtoken";

/**
 * Configuration options for the NetSuite OAuth 2.0 (Client Credentials) client.
 */
export interface NetSuiteClientCredentialsConfig {
  /** The NetSuite Account ID (e.g., "123456" or "123456_SB1"). */
  accountId: string;
  /** The Integration Client ID (Consumer Key) generated in NetSuite. */
  consumerKey: string;
  /** The Integration Client Secret (Consumer Secret) generated in NetSuite. */
  consumerSecret: string;
  /** The ID of the certificate record uploaded to NetSuite. */
  certificateId: string;
  /** The PEM-formatted private key corresponding to the uploaded certificate. */
  privateKey: string;
}

/**
 * Represents cached token data.
 */
export interface TokenData {
  /** The access token string used for authorization. */
  accessToken: string;
  /** The millisecond timestamp when the access token expires. */
  expiresAt: number;
}

/**
 * Storage interface for caching OAuth 2.0 access tokens.
 * Implement this interface to cache tokens in a database, redis, memory, etc.
 */
export interface TokenStorage {
  /**
   * Retrieves the currently stored token data.
   * @returns A promise resolving to the token data or null if not cached.
   */
  getToken(): Promise<TokenData | null>;

  /**
   * Persists the token data.
   * @param token The token data to be saved.
   */
  saveToken(token: TokenData): Promise<void>;
}

/**
 * NetSuite OAuth 2.0 Client Credentials Authentication Client.
 * Implements the secure M2M (machine-to-machine) JWT bearer flow to fetch and manage NetSuite REST API access tokens.
 */
export class NetSuiteClientCredentialsClient {
  private tokenUrl: string;
  private config: NetSuiteClientCredentialsConfig;
  private storage: TokenStorage;

  /**
   * Creates a new NetSuite OAuth 2.0 authentication client.
   *
   * @param config The OAuth 2.0 configurations.
   * @param storage The token storage instance for caching.
   */
  constructor(config: NetSuiteClientCredentialsConfig, storage: TokenStorage) {
    this.config = config;
    this.storage = storage;
    this.tokenUrl = `https://${this.config.accountId.toUpperCase()}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`;
  }

  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 45 * 60;

    const header = {
      typ: "JWT",
      alg: "PS256",
      kid: this.config.certificateId,
    };

    const payload = {
      iss: this.config.consumerKey,
      scope: "restlets, rest_webservices",
      aud: this.tokenUrl,
      exp: exp,
      iat: now,
    };

    return jwt.sign(payload, this.config.privateKey, {
      algorithm: "PS256",
      header: header,
      allowInvalidAsymmetricKeyTypes: true,
    });
  }

  private async refreshToken(): Promise<string | null> {
    const authString = `${this.config.consumerKey}:${this.config.consumerSecret}`;
    const form = new URLSearchParams({
      grant_type: "client_credentials",
      client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: this.generateJWT(),
    });

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      body: form,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
      },
    });

    const data = await response.json();

    if (data?.access_token) {
      const expiresAt = Date.now() + 45 * 60 * 1000;

      await this.storage.saveToken({
        accessToken: data.access_token,
        expiresAt: expiresAt,
      });

      return data.access_token;
    }

    return null;
  }

  /**
   * Retrieves the current access token.
   * If a valid cached token exists, it is returned. Otherwise, a new token is fetched, cached, and returned.
   *
   * @returns A promise resolving to the access token string, or null if retrieval failed.
   */
  async getCurrentToken(): Promise<string | null> {
    const currentToken = await this.storage.getToken();
    const now = Date.now();

    if (!currentToken || currentToken.expiresAt < now) {
      return await this.refreshToken();
    }

    return currentToken.accessToken;
  }
}
