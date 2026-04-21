import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://www.automationexercise.com',
    headless: true,          // headless in CI — no monitor on GitHub runner
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
    ['./reporter/bstack-reporter']  // posts to BStack TM
  ],
})