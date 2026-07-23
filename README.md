# @abarreraaponte/netsuite-oauth2-client

> **Legal Disclaimer:** NetSuite is a registered trademark of Oracle Corporation. This project is an independent open-source library and is not affiliated with, sponsored by, or endorsed by Oracle Corporation or NetSuite.

---

High-performance, type-safe, and lightweight OAuth 2.0 Client Credentials client for Oracle NetSuite, built specifically for server-to-server (M2M) integrations.

> [!NOTE]
> This library supports **only** the OAuth 2.0 Client Credentials flow (using private key JWT assertions). Other flows like Authorization Code or Resource Owner Password Credentials are not supported.

---

## Features

- **ESM-First & Lightweight:** Fully optimized for ESM, zero external bloating dependencies, and compatible with modern runtimes (Node.js, serverless, edge).
- **Asymmetric JWT Assertion:** Implements robust token assertions using private PEM keys and JSON Web Tokens.
- **Pluggable Token Caching:** Simple, standard caching interfaces (`TokenStorage`) allowing you to plug in Redis, SQL database, Prisma, or in-memory storages.
- **AI Agent Compatible:** Clean TypeScript types and docstrings making it perfectly suited for LLM toolchains and autonomous coding agents.

---

## Installation

```bash
pnpm add @abarreraaponte/netsuite-oauth2-client
# or
npm install @abarreraaponte/netsuite-oauth2-client
```

---

## Usage

Configure the client by supplying your NetSuite Account ID, Consumer Key, Consumer Secret, Certificate ID, and Private Key:

```typescript
import {
  NetSuiteClientCredentialsClient,
  type TokenStorage,
  type TokenData,
} from "@abarreraaponte/netsuite-oauth2-client";

// Implement the TokenStorage interface to cache tokens
class MemoryTokenStorage implements TokenStorage {
  private cache: TokenData | null = null;

  async getToken(): Promise<TokenData | null> {
    return this.cache;
  }

  async saveToken(token: TokenData): Promise<void> {
    this.cache = token;
  }
}

const authClient = new NetSuiteClientCredentialsClient(
  {
    accountId: "123456_SB1",
    consumerKey: "YOUR_CONSUMER_KEY",
    consumerSecret: "YOUR_CONSUMER_SECRET",
    certificateId: "YOUR_CERTIFICATE_ID",
    privateKey: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----`,
  },
  new MemoryTokenStorage(),
);

// Automatically returns the cached token, or fetches a new one if expired
const accessToken = await authClient.getCurrentToken();

const response = await fetch(
  "https://123456-sb1.suitetalk.api.netsuite.com/services/rest/record/v1/metadata-catalog",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  },
);
```

---

## Configuration Options

The `NetSuiteClientCredentialsClient` constructor accepts a configuration object matching the `NetSuiteClientCredentialsConfig` interface:

| Option           | Type     | Required | Description                                                                                                           |
| ---------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `accountId`      | `string` | **Yes**  | Your NetSuite Account ID (e.g. `123456` or sandbox `123456_SB1`). Normalizes internally.                              |
| `consumerKey`    | `string` | **Yes**  | The client ID / Integration Consumer Key generated in NetSuite.                                                       |
| `consumerSecret` | `string` | **Yes**  | The client secret / Integration Consumer Secret generated in NetSuite.                                                |
| `certificateId`  | `string` | **Yes**  | The Certificate ID (`kid`) from the NetSuite Client Credentials Setup mapping.                                        |
| `privateKey`     | `string` | **Yes**  | The PEM-formatted private key corresponding to your certificate.                                                      |
| `algorithm`      | `string` | No       | JWT signing algorithm. Options: `"PS256"`, `"PS384"`, `"PS512"`, `"ES256"`, `"ES384"`, `"ES512"`. Default: `"PS256"`. |

---

## Generating Keys & Certificates (OpenSSL)

Depending on your security architecture, you can use either **RSA-PSS** (recommended for RSA) or **ECDSA** (Elliptic Curve, offering faster signing and smaller keys) signatures.

Generate your private key and self-signed certificate using the corresponding OpenSSL commands:

| Algorithm | Key Type        | Private Key Generation                                                                 | Self-Signed Certificate (Public)                                         |
| --------- | --------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **PS256** | RSA (2048-bit)  | `openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048`        | `openssl req -new -x509 -key private.pem -out certificate.pem -days 365` |
| **PS384** | RSA (3072-bit)  | `openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:3072`        | `openssl req -new -x509 -key private.pem -out certificate.pem -days 365` |
| **PS512** | RSA (4096-bit)  | `openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:4096`        | `openssl req -new -x509 -key private.pem -out certificate.pem -days 365` |
| **ES256** | EC (prime256v1) | `openssl genpkey -algorithm EC -out private.pem -pkeyopt ec_paramgen_curve:prime256v1` | `openssl req -new -x509 -key private.pem -out certificate.pem -days 365` |
| **ES384** | EC (secp384r1)  | `openssl genpkey -algorithm EC -out private.pem -pkeyopt ec_paramgen_curve:secp384r1`  | `openssl req -new -x509 -key private.pem -out certificate.pem -days 365` |
| **ES512** | EC (secp521r1)  | `openssl genpkey -algorithm EC -out private.pem -pkeyopt ec_paramgen_curve:secp521r1`  | `openssl req -new -x509 -key private.pem -out certificate.pem -days 365` |

### Setting Up in NetSuite:

1. Upload the generated `certificate.pem` to your NetSuite mapping settings under **Setup > Integration > OAuth 2.0 Client Credentials Setup**.
2. Copy the resulting **Certificate ID** mapping.
3. Load the `private.pem` content (private key) in your backend environment variables to initialize the client.

---

## Local Sample Script

To test the integration locally without setting up a pnpm workspace:

1. Copy the example env file at the root:
   ```bash
   cp .env.example .env
   ```
2. Fill in the required NetSuite credentials in `.env`.
3. Run the sample script:
   ```bash
   pnpm run sample
   # or
   npm run sample
   ```

---

## Caching Implementations

### Redis Cache Storage

```typescript
import { createClient } from "redis";
import type { TokenStorage, TokenData } from "@abarreraaponte/netsuite-oauth2-client";

class RedisTokenStorage implements TokenStorage {
  private client = createClient();
  private key = "netsuite:oauth_token";

  async getToken(): Promise<TokenData | null> {
    const data = await this.client.get(this.key);
    if (!data) return null;
    return JSON.parse(data);
  }

  async saveToken(token: TokenData): Promise<void> {
    const ttlSeconds = Math.max(1, Math.floor((token.expiresAt - Date.now()) / 1000));
    await this.client.setEx(this.key, ttlSeconds, JSON.stringify(token));
  }
}
```

### Prisma SQL Cache Storage

```typescript
import { PrismaClient } from "@prisma/client";
import type { TokenStorage, TokenData } from "@abarreraaponte/netsuite-oauth2-client";

class PrismaTokenStorage implements TokenStorage {
  private prisma = new PrismaClient();

  async getToken(): Promise<TokenData | null> {
    const record = await this.prisma.netSuiteToken.findFirst({
      orderBy: { expiresAt: "desc" },
    });
    if (!record) return null;
    return {
      accessToken: record.accessToken,
      expiresAt: Number(record.expiresAt),
    };
  }

  async saveToken(token: TokenData): Promise<void> {
    await this.prisma.netSuiteToken.create({
      data: {
        accessToken: token.accessToken,
        expiresAt: token.expiresAt,
      },
    });
  }
}
```

---

## License

This package is open-source software licensed under the [Apache-2.0 License](./LICENSE).
