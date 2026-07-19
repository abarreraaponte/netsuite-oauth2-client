# NetSuite Authentication

`@kitledger/netsuite-auth` provides lightweight, enterprise-ready authentication clients for Oracle NetSuite integrations.

It supports both:

1. **OAuth 2.0 (Client Credentials / JWT Flow)**
2. **OAuth 1.0a (Token-Based Authentication / TBA)**

---

## Installation

Add the package to your project:

```bash
pnpm add @kitledger/netsuite-auth
```

---

## Quick Start

### 1. Token-Based Authentication (TBA / OAuth 1.0a)

TBA is the standard, time-tested authentication mechanism for NetSuite Restlets and SOAP/REST web services.

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

// Generate dynamic signed header
const authHeader = tbaClient.getAuthorizationHeader(
  "GET",
  "https://123456-sb1.restlets.api.netsuite.com/services/restlet/custom/script",
);
```

### 2. OAuth 2.0 Client Credentials Flow

For modern server-to-server integrations. This flow requests short-lived access tokens from NetSuite using a JWT assertion signed with your private certificate.

```typescript
import { NetSuiteAuthClient, type TokenStorage } from "@kitledger/netsuite-auth/oauth2";

// Implement a simple cache storage (e.g. in-memory)
class SimpleStorage implements TokenStorage {
  private cache = null;
  async getToken() {
    return this.cache;
  }
  async saveToken(token) {
    this.cache = token;
  }
}

const authClient = new NetSuiteAuthClient(
  {
    accountId: "123456_SB1",
    consumerKey: "YOUR_CONSUMER_KEY",
    consumerSecret: "YOUR_CONSUMER_SECRET",
    certificateId: "YOUR_CERTIFICATE_ID",
    privateKey: "YOUR_PRIVATE_PEM_KEY",
  },
  new SimpleStorage(),
);

const token = await authClient.getCurrentToken();
```
