import { test, expect } from "@playwright/test";

test.describe("Регистрация", () => {
  test("новый пользователь регистрируется и попадает на главную", async ({ page }) => {
    const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.legendarium.ru`;

    await page.goto("/register");

    await page.getByPlaceholder("Анна").fill("Тестовый пользователь");
    await page.getByPlaceholder("user@mail.ru").fill(email);
    await page.getByPlaceholder("Минимум 6 символов").fill("secret123");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    // После успешной регистрации перенаправляет на главную,
    // в шапке вместо «Войти» появляется ссылка на профиль
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Профиль" })).toBeVisible();
  });

  test("повторная регистрация с занятым email показывает ошибку", async ({ page }) => {
    // user@legendarium.ru создаётся сидом
    await page.goto("/register");

    await page.getByPlaceholder("Анна").fill("Дубль");
    await page.getByPlaceholder("user@mail.ru").fill("user@legendarium.ru");
    await page.getByPlaceholder("Минимум 6 символов").fill("secret123");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    await expect(page).toHaveURL(/\/register\?error=exists/);
  });

  test("без согласия на обработку данных форма не отправляется", async ({ page }) => {
    await page.goto("/register");

    await page.getByPlaceholder("Анна").fill("Без согласия");
    await page.getByPlaceholder("user@mail.ru").fill("no-consent@test.legendarium.ru");
    await page.getByPlaceholder("Минимум 6 символов").fill("secret123");
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    // Браузерная валидация required-чекбокса не даёт уйти со страницы
    await expect(page).toHaveURL(/\/register/);
  });
});
