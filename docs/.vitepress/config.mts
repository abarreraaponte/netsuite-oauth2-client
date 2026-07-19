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
  },
  vite: {
    resolve: {
      alias: {
        "vue/server-renderer": require.resolve("vue/server-renderer"),
        vue: require.resolve("vue"),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/docs/guide" },
      {
        text: "Packages",
        items: [{ text: "NetSuite Auth", link: "/packages/netsuite-auth/" }],
      },
      { text: "API Reference", link: "/api/index.html", target: "_blank" },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/kitledger/kitledger" }],
    sidebar: {
      "/packages/netsuite-auth/": [
        { text: "Getting Started", link: "/packages/netsuite-auth/" },
        { text: "Advanced Usage", link: "/packages/netsuite-auth/advanced" },
        { text: "API Reference (TypeDoc)", link: "/api/index.html", target: "_blank" },
      ],
      "/": [
        {
          text: "Overview",
          items: [{ text: "Introduction", link: "/docs/guide" }],
        },
      ],
    },
  },
});
