# NetSuite Authentication

`@kitledger/netsuite-auth` provides lightweight, enterprise-ready authentication clients for Oracle NetSuite integrations.

It is designed for functional/technical consultants, power users, and **autonomous AI agents**.

---

## Supported Authentication Flows

Choose the authentication guide that matches your integration setup:

### 🔑 [OAuth 2.0 (Client Credentials)](/packages/netsuite-auth/client-credentials)

For modern server-to-server integrations. This flow signs a JWT assertion with a private certificate to request short-lived access tokens from NetSuite.

- [Getting Started](/packages/netsuite-auth/client-credentials#getting-started)
- [Advanced Token Caching](/packages/netsuite-auth/caching)

### 🔐 [OAuth 1.0a (Token-Based Authentication / TBA)](/packages/netsuite-auth/tba)

The standard, time-tested authentication mechanism for NetSuite Restlets and SOAP/REST web services using dynamic HMAC-SHA256 signatures.

- [Getting Started](/packages/netsuite-auth/tba#getting-started)
- [Signature Verification](/packages/netsuite-auth/tba#advanced-usage)

---

## 🤖 AI Agent Skill File

This package natively bundles an **AI Agent Skill File** (`SKILL.md`) to help LLMs and coding assistants (like Antigravity, Claude Code, or Cursor) correctly import and write auth code:

- **Location in package:** `skills/netsuite-auth/SKILL.md`
- **View on GitHub:** [netsuite-auth/skills/netsuite-auth/SKILL.md](https://github.com/kitledger/kitledger/blob/main/packages/netsuite-auth/skills/netsuite-auth/SKILL.md)

Agents can read this skill to automatically understand our subpath exports, token storage cache models, and header signature APIs.
