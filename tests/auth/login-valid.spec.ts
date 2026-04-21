import { test, expect } from "@playwright/test";

test.describe("auth — login", () => {
  test("valid user can login successfully", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[data-qa="login-email"]', "testing67868686@yopmail.com");
    await page.fill('input[data-qa="login-password"]', "123456");
    await page.click('button[data-qa="login-button"]');
    await expect(page.locator('a:has-text("Logout")')).toBeVisible();
  });
});
