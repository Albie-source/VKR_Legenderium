import { test, expect } from "@playwright/test";

// Учётные данные берутся из prisma/seed.ts — перед запуском тестов
// база должна быть заполнена командой `npx prisma db seed`.
const DEMO_USER = { email: "user@legendarium.ru", password: "user123" };

test.describe("Вход в аккаунт", () => {
  test("с верными данными пользователь попадает в личный кабинет", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(DEMO_USER.email);
    await page.getByPlaceholder("Введите пароль").fill(DEMO_USER.password);
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole("heading", { name: "Пользователь" })).toBeVisible();
  });

  test("с неверным паролем показывается сообщение об ошибке", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(DEMO_USER.email);
    await page.getByPlaceholder("Введите пароль").fill("неверный-пароль");
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Неверный email или пароль.")).toBeVisible();
  });

  test("неавторизованного пользователя со страницы профиля перенаправляет на вход", async ({ page }) => {
    await page.goto("/profile");

    await expect(page).toHaveURL(/\/login/);
  });
});
