import { test, expect } from "@playwright/test";

test.describe("Библиотека легенд", () => {
  test("показывает карточки опубликованных материалов", async ({ page }) => {
    await page.goto("/library");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("поиск фильтрует список материалов", async ({ page }) => {
    await page.goto("/library");

    const cardsBefore = await page.locator("article").count();
    expect(cardsBefore).toBeGreaterThan(0);

    const searchInput = page.getByPlaceholder("Поиск по названию или ключевым словам");
    await searchInput.fill("züzüzüzü-несуществующий-запрос-12345");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/search=/);
    await expect(page.locator("article")).toHaveCount(0);
  });

  test("открытие карточки ведёт на страницу материала", async ({ page }) => {
    await page.goto("/library");

    await page.locator("article").first().locator("a").first().click();

    await expect(page).toHaveURL(/\/materials\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
