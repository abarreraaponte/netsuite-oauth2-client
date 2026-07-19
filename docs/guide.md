# Introduction

Welcome to **Kitledger**!

Kitledger is a collection of high-performance, type-safe npm packages designed to simplify integrations, scripting, and automations within enterprise resource planning (ERP), customer relationship management (CRM), and general business software environments.

## Why Kitledger?

Integrating with legacy enterprise systems like NetSuite, Salesforce, or SAP is historically cumbersome:

- **Obscure Authentication Protocols:** Navigating complex OAuth signatures (like OAuth 1.0a TBA) or certificate-based assertion setups.
- **Supply-Chain Bloat:** Large, bloated SDKs that drag in dozens of unnecessary dependencies.
- **AI Agent Friction:** Traditional SDKs are often difficult for LLM-based autonomous agents to inspect and use reliably due to a lack of explicit typing and context-free APIs.

Kitledger solves this by delivering **clean, ESM-first, zero-dependency-centric libraries** equipped with professional JSDoc/TSDoc comments, making them highly compatible with human developers and AI agents alike.

## Current Utilities

### 🔑 [NetSuite Authentication](/packages/netsuite-auth/)

A lightweight auth package supporting:

- **OAuth 1.0a (Token-Based Authentication / TBA)**
- **OAuth 2.0 (Client Credentials / JWT Flow)**
- Modular subpath exports (`@kitledger/netsuite-auth/oauth1` and `@kitledger/netsuite-auth/oauth2`)

## API Reference

The complete API reference for all packages can be accessed [here](/api/index.html).

---

## Technical Stack

Kitledger is built using cutting-edge JS/TS ecosystem tooling:

- **TypeScript 7** for type checking and declaration maps
- **tsdown** & **Rolldown** for ultra-fast bundlings
- **Oxc Formatter (`oxfmt`)** for high-speed code formatting
- **Vitest** for quick test execution
- **VitePress** & **TypeDoc** for markdown API documentation
