import { test, expect } from "@playwright/test";

// Учётные данные из prisma/seed.ts
const ADMIN = { email: "admin@legendarium.ru", password: "admin123" };
const DEMO_USER = { email: "user@legendarium.ru", password: "user123" };

async function login(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByPlaceholder("Введите пароль").fill(creds.password);
  await page.getByRole("button", { name: "Войти" }).click();
}

test.describe("Доступ к административной панели", () => {
  test("анонимного посетителя перенаправляет на вход", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login/);
  });

  test("обычному пользователю админка недоступна", async ({ page }) => {
    await login(page, DEMO_USER);
    await expect(page).toHaveURL(/\/profile/);

    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login/);
  });

  test("администратор видит панель управления", async ({ page }) => {
    await login(page, ADMIN);

    await page.goto("/admin");

    await expect(
      page.getByRole("heading", { name: "Управление платформой" }),
    ).toBeVisible();
    await expect(page.getByText(ADMIN.email)).toBeVisible();
  });
});
