# Kitledger

> **Modern developer utilities for business management systems.** Built for functional consultants, technical architects, power users, and autonomous AI agents.

Kitledger is a collection of high-performance, type-safe npm packages designed to simplify integrations, scripting, and automations within enterprise resource planning (ERP), customer relationship management (CRM), and business software ecosystems.

Enterprise software is notoriously difficult to integrate with. Kitledger bridges the gap by delivering developer-friendly, zero-bloat, ESM-first utilities that are compatible with modern runtimes (Node.js, Edge, Serverless) and easily understood by AI agent toolchains.

---

## Packages

| Package                                                          | Version | Description                                                                  |
| :--------------------------------------------------------------- | :------ | :--------------------------------------------------------------------------- |
| [`@kitledger/netsuite-auth`](./packages/netsuite-auth/README.md) | `1.0.0` | Authentication clients for Oracle NetSuite (OAuth 1.0a TBA & OAuth 2.0 JWT). |

---

## Philosophy

- **Functional & Technical Alignment:** Designed to be accessible to technical consultants and power users, not just core software engineers.
- **AI Agent-Ready:** Clean APIs, strict types, and lightweight footprints that allow LLM-based autonomous agents to easily reason about and write integration code.
- **Modern Tech Stack:** Powered by **TypeScript 7**, compiled with **tsdown** (Rolldown/Oxc), formatted with **oxfmt**, and tested with **Vitest**.
- **Minimal Dependencies:** Keeping dependencies to an absolute minimum to avoid supply-chain bloat and compile-time issues.

---

## Development

This repository is structured as a `pnpm` monorepo workspace.

### Setup

Ensure you have `pnpm` (v11+) installed:

```bash
pnpm install
```

### Build Packages

Build all workspace packages:

```bash
pnpm build
```

### Run Tests

Execute tests across the workspace:

```bash
pnpm test
```

### Format Code

Check and apply formatting via the Oxc formatter:

```bash
pnpm format
```

---

## License

Kitledger is open-source software licensed under the [Apache-2.0 License](./LICENSE).
