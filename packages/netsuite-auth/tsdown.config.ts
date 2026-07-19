import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts", "./src/oauth1.ts", "./src/oauth2.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
