import { test, expect } from "@playwright/test";

test.describe("auth — login", () => {
  test("wrong password shows error message", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[data-qa="login-email"]', "testuser@poc.com");
    await page.fill('input[data-qa="login-password"]', "WrongPassword!");
    await page.click('button[data-qa="login-button"]');
    await expect(
      page.locator('p:has-text("Your email or password is incorrect!")')
    ).toBeVisible();
  });
});
