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
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
});

test("news pagination and keyword search use query URLs", async ({ page }) => {
  await page.goto("/news/?page=2");
  await expect(page.getByText("共 9 篇内容，第 1/1 页")).toBeVisible();
  await page.goto("/news/?q=医生");
  await expect(
    page.getByRole("heading", { name: "Express Entry 医生类别举行邀请轮次" }),
  ).toBeVisible();
  await expect(page.getByText("学习许可生活费证明标准")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  await page.goto("/content/?page=2");
  await expect(page.getByText("第 2 / 2 页")).toBeVisible();
});

test("all content and data placeholder are reachable", async ({ page }) => {
  await page.goto("/content/");
  await expect(page.getByRole("heading", { name: "全部内容" })).toBeVisible();
  await page.goto("/content/?type=program-guide");
  await expect(page.getByRole("link", { name: "Express Entry 快速通道" })).toBeVisible();
  await page.goto("/content/?program=express-entry");
  await expect(page.getByRole("link", { name: "Express Entry 快速通道" })).toBeVisible();
  await page.goto("/programs/bc-pnp-skilled-worker/");
  await expect(page).toHaveURL(/\/content\/bc-pnp-skilled-worker\/$/);
  await page.goto("/data/");
  await expect(page.getByText("数据栏目正在建设中。")).toBeVisible();
  await page.goto("/content/?q=不存在的内容");
  await expect(page.getByRole("status")).toContainText("没有符合条件");
});

test("draft news is not publicly generated", async ({ page }) => {
  const response = await page.goto("/news/sample-draft/");
  expect(response?.status()).toBe(404);
});

test("mobile navigation does not overflow the header", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await expect(page.getByText("菜单", { exact: true })).toBeVisible();
  await expect(page.locator('nav[aria-label="主导航"]')).toBeHidden();
  await expect(page.locator('nav[aria-label="移动端主导航"]')).toBeHidden();
  await page.getByText("菜单", { exact: true }).click();
  await expect(page.locator('nav[aria-label="移动端主导航"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
