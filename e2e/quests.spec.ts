import { test, expect } from "@playwright/test";

test.describe("Интерактивные задания", () => {
  test("список заданий открывается и содержит карточки", async ({ page }) => {
    await page.goto("/quests");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const questCards = page.locator('a[href^="/quests/"]');
    expect(await questCards.count()).toBeGreaterThan(0);
  });

  test("страница задания открывается из списка", async ({ page }) => {
    await page.goto("/quests");

    const firstQuest = page.locator('a[href^="/quests/"]').first();
    await firstQuest.click();

    await expect(page).toHaveURL(/\/quests\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
