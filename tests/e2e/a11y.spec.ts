import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/news/",
  "/news/study-permit-financial-support-increase-2026/",
  "/content/express-entry/",
  "/content/",
  "/data/",
  "/privacy/",
  "/disclaimer/",
  "/corrections/",
];

test("core pages have no serious axe violations", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `${route} has accessibility violations`).toEqual([]);
  }
});

test("core mobile paths remain usable with reduced motion and zoom", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/news/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    375 * 2,
  );
});
