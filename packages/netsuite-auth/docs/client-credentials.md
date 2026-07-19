# OAuth 2.0 (Client Credentials)

The OAuth 2.0 Client Credentials flow is NetSuite's modern standard for machine-to-machine (M2M) server integrations. It uses an asymmetric key pair (JWT assertions signed with your private key) to request temporary access tokens.

---

## Getting Started

### 1. Import the Client

Import the client specifically from the `/oauth2` subpath:

```typescript
import { NetSuiteAuthClient } from "@kitledger/netsuite-auth/oauth2";
```

### 2. Configure and Initialize

Create an instance by passing your NetSuite authentication keys and a cache storage implementation:

```typescript
import { NetSuiteAuthClient, type TokenStorage } from "@kitledger/netsuite-auth/oauth2";

// Define a simple in-memory cache storage for development
const memoryStorage: TokenStorage = {
  cache: null,
  async getToken() {
    return this.cache;
  },
  async saveToken(token) {
    this.cache = token;
  },
};

const authClient = new NetSuiteAuthClient(
  {
    accountId: "123456_SB1",
    consumerKey: "YOUR_INTEGRATION_CLIENT_ID",
    consumerSecret: "YOUR_INTEGRATION_CLIENT_SECRET",
    certificateId: "YOUR_UPLOADED_CERTIFICATE_ID",
    privateKey: "YOUR_PEM_PRIVATE_KEY",
  },
  memoryStorage,
);
```

### 3. Retrieve Access Tokens

Retrieve the current valid token. If the cached token is expired or missing, it will automatically call NetSuite to request a new token and update the cache:

```typescript
const accessToken = await authClient.getCurrentToken();

if (accessToken) {
  // Use in your authorization header
  const response = await fetch(
    "https://123456-sb1.suitetalk.api.netsuite.com/services/rest/record/v1/customer",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}
```

---

## Advanced Usage

### Custom Token Caching

In production environments, in-memory caching is insufficient because application restarts or multiple server instances will cause redundant token request throttling.

For standard caching implementations using **Redis** or **Prisma/PostgreSQL**, refer to our dedicated **[Token Caching Guide](/packages/netsuite-auth/caching)**.

---

## 🤖 AI Integration Notes

For AI coding assistants, refer to the [netsuite-auth-skill](https://github.com/kitledger/kitledger/blob/main/packages/netsuite-auth/skills/netsuite-auth/SKILL.md) for caching rules and integration configurations.
