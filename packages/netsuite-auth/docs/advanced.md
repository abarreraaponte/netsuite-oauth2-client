# Advanced Token Caching

When using **OAuth 2.0 Client Credentials**, NetSuite access tokens are short-lived (usually expiring in 60 minutes). It is critical to cache the tokens to avoid making a token refresh HTTP request before every single API call.

`@kitledger/netsuite-auth` makes this simple by separating token storage logic from the client. You can plug in any cache storage that implements the `TokenStorage` interface.

---

## The `TokenStorage` Interface

The interface specifies two methods:

```typescript
export interface TokenStorage {
  getToken(): Promise<TokenData | null>;
  saveToken(token: TokenData): Promise<void>;
}
```

---

## Implementation Examples

### Redis Cache Storage

A standard implementation for server-side environments using Redis to share tokens across multiple application instances:

```typescript
import { createClient } from "redis";
import type { TokenStorage, TokenData } from "@kitledger/netsuite-auth/oauth2";

export class RedisTokenStorage implements TokenStorage {
  private redis;
  private key = "netsuite:oauth2:token";

  constructor(redisClient) {
    this.redis = redisClient;
  }

  async getToken(): Promise<TokenData | null> {
    const raw = await this.redis.get(this.key);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  async saveToken(token: TokenData): Promise<void> {
    const ttlSeconds = Math.max(0, Math.floor((token.expiresAt - Date.now()) / 1000));
    await this.redis.set(this.key, JSON.stringify(token), {
      EX: ttlSeconds,
    });
  }
}
```

### PostgreSQL / Prisma Storage

If you prefer storing cached tokens in a relational database:

```typescript
import { PrismaClient } from "@prisma/client";
import type { TokenStorage, TokenData } from "@kitledger/netsuite-auth/oauth2";

const prisma = new PrismaClient();

export class PrismaTokenStorage implements TokenStorage {
  async getToken(): Promise<TokenData | null> {
    const record = await prisma.cachedToken.findUnique({
      where: { id: "netsuite" },
    });
    if (!record) return null;
    return {
      accessToken: record.accessToken,
      expiresAt: record.expiresAt.getTime(),
    };
  }

  async saveToken(token: TokenData): Promise<void> {
    await prisma.cachedToken.upsert({
      where: { id: "netsuite" },
      create: {
        id: "netsuite",
        accessToken: token.accessToken,
        expiresAt: new Date(token.expiresAt),
      },
      update: {
        accessToken: token.accessToken,
        expiresAt: new Date(token.expiresAt),
      },
    });
  }
}
```
