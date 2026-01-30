import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    exclude: ["tests/e2e/**", "node_modules/**"]
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./", import.meta.url)),
      "@": fileURLToPath(new URL("./", import.meta.url))
    }
  }
});
