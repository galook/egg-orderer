import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3001",
    headless: true
  },
  webServer: {
    command: "npm run dev -- --port 3001 --host 127.0.0.1",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: true,
    env: {
      NUXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud"
    }
  }
});
