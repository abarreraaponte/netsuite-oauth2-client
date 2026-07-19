---
layout: home

hero:
  name: Kitledger
  text: Enterprise Integrations, Simplified.
  tagline: Modern developer utilities for ERPs, CRMs, and autonomous AI agents.
  actions:
    - theme: brand
      text: Get Started
      link: /guide
    - theme: alt
      text: View API Docs
      link: /api/netsuite-auth/index.html
      target: _blank

features:
  - icon: 🔐
    title: Enterprise Authentication
    details: Fully compliant OAuth 1.0a TBA and OAuth 2.0 Client Credentials clients configured for maximum compatibility.
  - icon: 🤖
    title: AI Agent Compatible
    details: Clean type signatures, zero-bloat APIs, and descriptive docstrings allowing LLMs to seamlessly write and run integrations.
  - icon: ⚡
    title: High-Performance
    details: Built with TypeScript 7, tsdown, and Rolldown for near-instant execution speeds and lightweight bundle footprints.
---

<div class="home-code-section">

## Quick Start

Get authenticated with NetSuite using OAuth 2.0 Client Credentials in just a few lines of code:

```typescript
import { NetSuiteAuthClient } from "@kitledger/netsuite-auth/oauth2";

const client = new NetSuiteAuthClient(
  {
    accountId: "123456_SB1",
    consumerKey: "YOUR_CONSUMER_KEY",
    consumerSecret: "YOUR_CONSUMER_SECRET",
    certificateId: "YOUR_CERTIFICATE_ID",
    privateKey: "YOUR_PEM_PRIVATE_KEY",
  },
  tokenStorage,
);

// Automatically requests new tokens when cached tokens expire
const accessToken = await client.getCurrentToken();
```

</div>
