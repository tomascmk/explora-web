import { test, expect } from "@playwright/test";

/**
 * Public login page e2e (no backend required). Verifies the page renders and
 * the form is wired. Authenticated flows that call the backend belong in a
 * separate spec gated on the API being available.
 */
test.describe("Login page", () => {
  test("renders the guide login form", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /sign in|welcome|login/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("guide@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log ?in/i })).toBeVisible();
  });

  test("lets the user type credentials", async ({ page }) => {
    await page.goto("/login");
    const email = page.getByPlaceholder("guide@example.com");
    const password = page.getByPlaceholder("••••••••");
    await email.fill("guide@example.com");
    await password.fill("secret123");
    await expect(email).toHaveValue("guide@example.com");
    await expect(password).toHaveValue("secret123");
  });

  test("requires email and password (native validation)", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in|log ?in/i }).first().click();
    // Empty required email blocks submission — we stay on /login.
    await expect(page).toHaveURL(/\/login/);
  });
});
