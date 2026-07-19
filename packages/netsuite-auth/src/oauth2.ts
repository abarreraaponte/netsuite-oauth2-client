import jwt from "jsonwebtoken";

export interface NetSuiteAuthConfig {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  certificateId: string;
  privateKey: string;
}

export interface TokenData {
  accessToken: string;
  expiresAt: number;
}

export interface TokenStorage {
  getToken(): Promise<TokenData | null>;
  saveToken(token: TokenData): Promise<void>;
}

export class NetSuiteAuthClient {
  private tokenUrl: string;
  private config: NetSuiteAuthConfig;
  private storage: TokenStorage;

  constructor(config: NetSuiteAuthConfig, storage: TokenStorage) {
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

  async getCurrentToken(): Promise<string | null> {
    const currentToken = await this.storage.getToken();
    const now = Date.now();

    if (!currentToken || currentToken.expiresAt < now) {
      return await this.refreshToken();
    }

    return currentToken.accessToken;
  }
}
