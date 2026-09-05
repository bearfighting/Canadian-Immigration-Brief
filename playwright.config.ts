import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm build && python3 -m http.server 3001 --directory out",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_SITE_URL: "https://m4-preview.example.com" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
