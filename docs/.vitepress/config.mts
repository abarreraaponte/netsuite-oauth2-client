import { defineConfig } from "vitepress";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export default defineConfig({
  title: "Kitledger",
  description: "Modern developer utilities for business management platforms.",
  srcDir: "../",
  ignoreDeadLinks: true, // Ignore dead link checks (such as relative LICENSE links outside the documentation scope)
  rewrites: {
    "packages/:pkg/docs/:sidebar*": "packages/:pkg/:sidebar*",
    "docs/:file*": ":file*", // Rewrite docs/index.md to index.md and docs/guide.md to guide.md
  },
  vite: {
    publicDir: "docs/public", // Explicitly direct Vite to copy docs/public/ to the build output root
    resolve: {
      alias: {
        "vue/server-renderer": require.resolve("vue/server-renderer"),
        vue: require.resolve("vue"),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide" },
      {
        text: "Packages",
        items: [{ text: "NetSuite Auth", link: "/packages/netsuite-auth/" }],
      },
      { text: "API Reference", link: "/api/netsuite-auth/index.html", target: "_blank" },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/kitledger/kitledger" }],
    sidebar: {
      "/packages/netsuite-auth/": [
        { text: "Overview", link: "/packages/netsuite-auth/" },
        {
          text: "OAuth 2.0 (Client Credentials)",
          link: "/packages/netsuite-auth/client-credentials",
        },
        { text: "OAuth 1.0a (TBA)", link: "/packages/netsuite-auth/tba" },
        { text: "Token Caching", link: "/packages/netsuite-auth/caching" },
        {
          text: "API Reference (TypeDoc)",
          link: "/api/netsuite-auth/index.html",
          target: "_blank",
        },
      ],
      "/": [
        {
          text: "Overview",
          items: [{ text: "Introduction", link: "/guide" }],
        },
      ],
    },
  },
});
