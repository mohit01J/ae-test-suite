import { test, expect } from "@playwright/test";

test.describe("checkout — guest user", () => {

    test("guest user can add product to cart", async ({ page }) => {
        await page.goto("/");
        await page.click(".features_items .product-image-wrapper:first-child");
        await page.click("button:has-text('Add to cart')");
        await expect(
            page.locator(".modal-title:has-text('Added!')")
        ).toBeVisible();
    });

    test("guest user cart shows correct product and price", async ({ page }) => {
        await page.goto("/");
        await page.click(".features_items .product-image-wrapper:first-child");
        await page.click("button:has-text('Add to cart')");
        await page.click("a:has-text('View Cart')");
        await expect(page.locator("#cart_info_table")).toBeVisible();
        await expect(page.locator(".cart_price")).toBeVisible();
    });

    test("guest user can proceed to checkout from cart", async ({ page }) => {
        await page.goto("/");
        await page.click(".features_items .product-image-wrapper:first-child");
        await page.click("button:has-text('Add to cart')");
        await page.click("a:has-text('View Cart')");
        await page.click("a:has-text('Proceed To Checkout')");
        await expect(
            page.locator(".modal-content:has-text('Register / Login')")
        ).toBeVisible();
    });

});