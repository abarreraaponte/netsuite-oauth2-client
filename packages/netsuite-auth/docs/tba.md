# OAuth 1.0a (Token-Based Authentication / TBA)

Token-Based Authentication (TBA) is NetSuite's traditional, highly robust HMAC-SHA256 signature mechanism. It is ideal for RESTlets and legacy SOAP services.

---

## Getting Started

### 1. Import the Client

Import the client specifically from the `/oauth1` or `/tba` subpaths:

```typescript
import { NetSuiteTBAClient } from "@kitledger/netsuite-auth/oauth1";
// Or:
// import { NetSuiteTBAClient } from "@kitledger/netsuite-auth/tba";
```

### 2. Configure and Initialize

Initialize the client with your account and integration credentials:

```typescript
import { NetSuiteTBAClient } from "@kitledger/netsuite-auth/oauth1";

const tbaClient = new NetSuiteTBAClient({
  accountId: "123456_SB1",
  consumerKey: "YOUR_INTEGRATION_CONSUMER_KEY",
  consumerSecret: "YOUR_INTEGRATION_CONSUMER_SECRET",
  tokenId: "YOUR_USER_TOKEN_ID",
  tokenSecret: "YOUR_USER_TOKEN_SECRET",
});
```

### 3. Generate Auth Headers

TBA signatures are dynamic and time-sensitive. Generate the auth header immediately before dispatching the request:

```typescript
const method = "GET";
const url = "https://123456-sb1.restlets.api.netsuite.com/services/restlet/custom/script";

const authHeader = tbaClient.getAuthorizationHeader(method, url);

const response = await fetch(url, {
  method,
  headers: {
    Authorization: authHeader,
    "Content-Type": "application/json",
  },
});
```

---

## Advanced Usage

### Dynamic Query Parameters

TBA signature calculations must include all query parameters present in the request URL. If your target URL contains search parameters, make sure they are appended to the URL passed to `getAuthorizationHeader`:

```typescript
const baseUrl = "https://123456-sb1.restlets.api.netsuite.com/services/restlet/custom/script";
const urlWithParams = `${baseUrl}?recordType=customer&id=100`;

// The client automatically parses query params to compute the signature base string correctly
const authHeader = tbaClient.getAuthorizationHeader("GET", urlWithParams);
```

---

## 🤖 AI Integration Notes

For AI coding assistants, refer to the [netsuite-auth-skill](https://github.com/kitledger/kitledger/blob/main/packages/netsuite-auth/skills/netsuite-auth/SKILL.md) for signing rules and endpoint requirements.
