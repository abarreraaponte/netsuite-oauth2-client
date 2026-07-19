---
name: netsuite-auth-skill
description: Guidelines and code patterns for using the `@kitledger/netsuite-auth` package to authenticate with NetSuite REST APIs, RESTlets, and SOAP services.
---

# NetSuite Auth Skill

This skill contains precise usage rules, security practices, and code patterns for using the `@kitledger/netsuite-auth` library in Node.js/TypeScript codebases.

## Core Rules

### 1. Endpoint imports

Always import modules directly from their designated subpath endpoints rather than the root package:

- For OAuth 2.0 Client Credentials:
  ```typescript
  import { NetSuiteAuthClient } from "@kitledger/netsuite-auth/oauth2";
  ```
- For OAuth 1.0a Token-Based Authentication (TBA):
  ```typescript
  import { NetSuiteTBAClient } from "@kitledger/netsuite-auth/oauth1";
  // or alias:
  import { NetSuiteTBAClient } from "@kitledger/netsuite-auth/tba";
  ```

### 2. Private Keys and Secret management

- **NEVER** hardcode private keys, consumer secrets, or token secrets in the codebase.
- Load them from environment variables or a secure vault:
  ```typescript
  const privateKey = process.env.NETSUITE_PRIVATE_KEY;
  ```
- Make sure private PEM keys have correct line breaks (`\n`) if retrieved from env vars.

### 3. Caching OAuth 2.0 Tokens

- Access tokens expire in 60 minutes.
- **Always** implement and pass a `TokenStorage` instance to `NetSuiteAuthClient` to cache tokens and prevent making refresh requests on every single call.
- Example custom Redis storage:
  ```typescript
  import type { TokenStorage, TokenData } from "@kitledger/netsuite-auth/oauth2";

  class RedisStorage implements TokenStorage {
    async getToken(): Promise<TokenData | null> {
      // retrieve from Redis
    }
    async saveToken(token: TokenData): Promise<void> {
      // save to Redis with expiration
    }
  }
  ```

### 4. TBA Signatures

- NetSuite TBA signatures are dynamic and time-sensitive.
- Call `.getAuthorizationHeader(method, url)` immediately before sending the request:
  ```typescript
  const header = client.getAuthorizationHeader(
    "GET",
    "https://123456.restlets.api.netsuite.com/services/restlet/custom/script",
  );
  ```
