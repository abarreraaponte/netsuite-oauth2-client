---
name: netsuite-oauth2-client-skill
description: Guidelines and code patterns for using the `@abarreraaponte/netsuite-oauth2-client` package to authenticate with NetSuite REST APIs and RESTlets using OAuth 2.0 Client Credentials.
---

# NetSuite OAuth 2.0 Client Skill

This skill contains precise usage rules, security practices, and code patterns for using the `netsuite-oauth2-client` library in Node.js/TypeScript codebases.

## Core Rules

### 1. Endpoint imports

Always import modules directly from the package root:

```typescript
import { NetSuiteClientCredentialsClient } from "@abarreraaponte/netsuite-oauth2-client";
```

Alternatively, you can import from the `/oauth2` subpath:

```typescript
import { NetSuiteClientCredentialsClient } from "@abarreraaponte/netsuite-oauth2-client/oauth2";
```

### 2. Private Keys and Secret management

- **NEVER** hardcode private keys, consumer secrets, or certificate IDs in the codebase.
- Load them from environment variables or a secure secret manager:
  ```typescript
  const privateKey = process.env.NETSUITE_PRIVATE_KEY;
  ```
- Make sure private PEM keys have correct line breaks (`\n`) if loaded from environment configurations.

### 3. Caching OAuth 2.0 Tokens

- Access tokens expire in 60 minutes.
- **Always** implement and pass a `TokenStorage` instance to `NetSuiteClientCredentialsClient` to cache tokens and prevent making redundant HTTP token assertion requests.
- Example custom in-memory storage:
  ```typescript
  import type { TokenStorage, TokenData } from "@abarreraaponte/netsuite-oauth2-client";

  class MemoryStorage implements TokenStorage {
    private cache: TokenData | null = null;

    async getToken(): Promise<TokenData | null> {
      return this.cache;
    }
    async saveToken(token: TokenData): Promise<void> {
      this.cache = token;
    }
  }
  ```
