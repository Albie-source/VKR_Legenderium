import { test, expect } from "@playwright/test";

test.describe("Главная страница и навигация", () => {
  test("главная страница открывается и показывает заголовок платформы", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Легендариум" }).first()).toBeVisible();
  });

  test("из шапки можно перейти в библиотеку, на карту и к заданиям", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Библиотека" }).first().click();
    await expect(page).toHaveURL(/\/library/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("link", { name: "Карта" }).first().click();
    await expect(page).toHaveURL(/\/map/);

    await page.getByRole("link", { name: "Задания" }).first().click();
    await expect(page).toHaveURL(/\/quests/);
  });
});
