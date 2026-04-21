import { test, expect } from "@playwright/test";

test.describe("checkout — registered user", () => {

    test.beforeEach(async ({ page }) => {
        // login before each test in this suite
        await page.goto("/login");
        await page.fill('input[data-qa="login-email"]', "testing67868686@yopmail.com");
        await page.fill('input[data-qa="login-password"]', "123456");
        await page.click('button[data-qa="login-button"]');
        await expect(page.locator('a:has-text("Logout")')).toBeVisible();
    });

    test("registered user can add product to cart", async ({ page }) => {
        await page.goto("/");
        await page.click(".features_items .product-image-wrapper:first-child");
        await page.click("button:has-text('Add to cart')");
        await expect(
            page.locator(".modal-title:has-text('Added!')")
        ).toBeVisible();
    });

    test("registered user cart shows correct total", async ({ page }) => {
        await page.goto("/");
        await page.click(".features_items .product-image-wrapper:first-child");
        await page.click("button:has-text('Add to cart')");
        await page.click("a:has-text('View Cart')");
        await expect(page.locator("#cart_info_table")).toBeVisible();
        await expect(page.locator(".cart_total_price")).toBeVisible();
    });

    test("registered user can reach checkout address page", async ({ page }) => {
        await page.goto("/");
        await page.click(".features_items .product-image-wrapper:first-child");
        await page.click("button:has-text('Add to cart')");
        await page.click("a:has-text('View Cart')");
        await page.click("a:has-text('Proceed To Checkout')");
        await expect(
            page.locator("h2:has-text('Address Details')")
        ).toBeVisible();
    });

});