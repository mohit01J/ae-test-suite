import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "https://www.automationexercise.com",
    headless: false, // ← tester sees the browser
    launchOptions: {
      slowMo: 600, // ← slows actions so human can follow
    },
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 720 },
  },
  reporter: [["list"], ["json", { outputFile: "test-results.json" }]],
});
