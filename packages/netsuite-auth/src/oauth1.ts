import { createHmac, randomBytes } from "node:crypto";

export interface NetSuiteTBAConfig {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
}

export class NetSuiteTBAClient {
  private config: NetSuiteTBAConfig;

  constructor(config: NetSuiteTBAConfig) {
    this.config = config;
  }

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
