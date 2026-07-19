# @kitledger/netsuite-auth

> **Legal Disclaimer:** NetSuite is a registered trademark of Oracle Corporation. This project is an independent open-source library and is not affiliated with, sponsored by, or endorsed by Oracle Corporation or NetSuite.

---

Enterprise-grade authentication clients for Oracle NetSuite, built for speed, portability, and compatibility.

This package supports both modern server-to-server **OAuth 2.0 (Client Credentials)** flows and legacy **OAuth 1.0a (Token-Based Authentication / TBA)** flows. It is split into modular subpaths so you only import what your environment supports.

### [Explore @kitledger/netsuite-auth API Reference](https://kitledger.github.io/kitledger/api/)

---

## Features

- **ESM-First with Subpaths:** Import directly from subpaths (`/oauth1`, `/oauth2`, `/tba`) to minimize dependency loading.
- **Zero-Dependency TBA:** The OAuth 1.0a client uses Node's native `crypto` module, making it lightweight and compatible with serverless/edge environments.
- **Standardized OAuth 2.0:** Secure M2M JWT assertions powered by `jsonwebtoken`.
- **Token Caching Layer:** Comes with standard interfaces to plug in custom cache storages (Redis, database, in-memory, etc.).

---

## Installation

Install via your preferred package manager:

```bash
pnpm add @kitledger/netsuite-auth
# or
npm install @kitledger/netsuite-auth
```

---

## Usage

### 1. OAuth 2.0 Client Credentials (M2M JWT Flow)

Recommended for modern, secure server-to-server integrations.

```typescript
import {
  NetSuiteAuthClient,
  type TokenStorage,
  type TokenData,
} from "@kitledger/netsuite-auth/oauth2";

// Implement your own storage (database, file, redis, etc.)
class CustomTokenStorage implements TokenStorage {
  async getToken(): Promise<TokenData | null> {
    // Retrieve token from cache/DB
  }
  async saveToken(token: TokenData): Promise<void> {
    // Save token to cache/DB
  }
}

const authClient = new NetSuiteAuthClient(
  {
    accountId: "123456_SB1",
    consumerKey: "YOUR_CONSUMER_KEY",
    consumerSecret: "YOUR_CONSUMER_SECRET",
    certificateId: "YOUR_CERTIFICATE_ID",
    privateKey: "YOUR_PEM_FORMAT_PRIVATE_KEY",
  },
  new CustomTokenStorage(),
);

// Automatically handles fetching a new token or returning the cached one
const token = await authClient.getCurrentToken();

const response = await fetch(
  "https://123456-sb1.suitetalk.api.netsuite.com/services/rest/record/v1/metadata-catalog",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);
```

### 2. OAuth 1.0a / Token-Based Authentication (TBA)

Compatible with Restlets and SuiteTalk REST/SOAP services requiring signed request headers.

```typescript
import { NetSuiteTBAClient } from "@kitledger/netsuite-auth/oauth1";
// Or use the familiar alias:
// import { NetSuiteTBAClient } from "@kitledger/netsuite-auth/tba";

const tbaClient = new NetSuiteTBAClient({
  accountId: "123456_SB1",
  consumerKey: "YOUR_CONSUMER_KEY",
  consumerSecret: "YOUR_CONSUMER_SECRET",
  tokenId: "YOUR_TOKEN_ID",
  tokenSecret: "YOUR_TOKEN_SECRET",
});

const method = "GET";
const url = "https://123456-sb1.restlets.api.netsuite.com/services/restlet/custom/script";

// Generates the standard Authorization header with a dynamic HMAC-SHA256 signature
const authHeader = tbaClient.getAuthorizationHeader(method, url);

const response = await fetch(url, {
  method,
  headers: {
    Authorization: authHeader,
  },
});
```

---

## License

This package is licensed under the [Apache-2.0 License](../../LICENSE).
