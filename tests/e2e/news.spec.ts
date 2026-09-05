import { expect, test } from "@playwright/test";

test("published news is readable", async ({ page }) => {
  await page.goto("/news/study-permit-financial-support-increase-2026/");
  await expect(
    page.getByRole("heading", { name: "魁北克以外学习许可申请人的生活费证明标准上调至23,448加元" }),
  ).toBeVisible();
  await expect(page.getByText("已生效").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "官方来源" }).first()).toBeVisible();
});

test("news index only links to published content", async ({ page }) => {
  await page.goto("/news/");
  await expect(page.getByRole("heading", { name: "最新动态" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "魁北克以外学习许可申请人的生活费证明标准上调至23,448加元" }),
  ).toBeVisible();
  await expect(page.getByText("草稿：待审核的样例内容")).toHaveCount(0);
  await expect(page).toHaveTitle(/最新动态/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/news\/$/);
});

test("draft news is not publicly generated", async ({ page }) => {
  const response = await page.goto("/news/sample-draft/");
  expect(response?.status()).toBe(404);
});
