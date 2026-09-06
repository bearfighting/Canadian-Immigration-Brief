import { expect, test } from "@playwright/test";

test("published news is readable", async ({ page }) => {
  await page.goto("/news/study-permit-financial-support-increase-2026/");
  await expect(
    page.getByRole("heading", { name: "魁北克以外学习许可申请人的生活费证明标准上调至23,448加元" }),
  ).toBeVisible();
  await expect(page.getByText("已生效").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "官方来源" }).first()).toBeVisible();
});

test("news archive remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/news/");
  await expect(
    page.getByRole("link", { name: "魁北克以外学习许可申请人的生活费证明标准上调至23,448加元" }),
  ).toBeVisible();
  await expect(page.getByText("草稿：待审核的样例内容")).toHaveCount(0);
  await context.close();
});

test("news fact box exposes event dates and source publisher", async ({ page }) => {
  await page.goto("/news/express-entry-physicians-draw-september-2026/");
  const facts = page.locator('section[aria-labelledby="key-facts"]');
  await expect(facts.getByText("事件日期")).toBeVisible();
  await expect(
    facts.locator("dt").filter({ hasText: "事件日期" }).locator("..").getByRole("definition"),
  ).toHaveText("2026/9/3");
  await expect(page.getByText("发布机构：IRCC")).toBeVisible();
});

test("home page exposes quick discovery tools", async ({ page }) => {
  await page.goto("/");
  const discovery = page.getByRole("complementary", { name: "快速发现" });
  await expect(discovery).toBeVisible();
  await expect(page.getByLabel("搜索标题或摘要")).toBeVisible();
  const searchRow = discovery.locator("form > div");
  const [discoveryBox, searchRowBox] = await Promise.all([
    discovery.boundingBox(),
    searchRow.boundingBox(),
  ]);
  expect(searchRowBox ? searchRowBox.x + searchRowBox.width : 0).toBeLessThanOrEqual(
    (discoveryBox ? discoveryBox.x + discoveryBox.width : 0) + 0.5,
  );
  await expect(
    page
      .getByRole("complementary", { name: "快速发现" })
      .getByRole("link", { name: "Ontario Workforce Priority Stream" }),
  ).toHaveAttribute("href", "/content/ontario-workforce-priority-stream/");
  await page.getByLabel("搜索标题或摘要").fill("医生");
  await page.getByRole("button", { name: "搜索" }).click();
  await expect(page).toHaveURL(/\/content\/\?q=%E5%8C%BB%E7%94%9F$/);
});

test("home discovery tools remain usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  const discovery = page.getByRole("complementary", { name: "快速发现" });
  await expect(discovery).toBeVisible();
  const discoveryTop = await discovery.evaluate((element) => element.getBoundingClientRect().top);
  const latestTop = await page
    .getByRole("heading", { name: "最新内容" })
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(discoveryTop).toBeLessThan(latestTop);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
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

test("non-news and legal pages expose their own canonical URLs", async ({ page }) => {
  await page.goto("/content/express-entry/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/content\/express-entry\/$/,
  );
  await page.goto("/privacy/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/privacy\/$/);
  await page.goto("/sitemap.xml");
  await expect(page.locator("body")).toContainText("/privacy/");
  await expect(page.locator("body")).toContainText("/disclaimer/");
  await expect(page.locator("body")).toContainText("/corrections/");
});

test("article pages expose accessible sharing controls", async ({ page }) => {
  await page.goto("/news/express-entry-physicians-draw-september-2026/");
  await expect(page.getByRole("heading", { name: "分享本文" })).toBeVisible();
  for (const name of ["系统分享", "复制链接"]) {
    await expect(page.getByRole("button", { name })).toBeVisible();
  }
  for (const name of [
    "分享到 Facebook",
    "分享到 X",
    "分享到 WhatsApp",
    "分享到 Telegram",
    "分享到 LinkedIn",
    "分享到微博",
  ]) {
    await expect(page.getByRole("link", { name })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "分享到 X" })).toHaveAttribute(
    "href",
    /https:\/\/x\.com\/intent\/tweet\?/,
  );
  await expect(page.getByRole("link", { name: "分享到微博" })).toHaveAttribute(
    "href",
    /https:\/\/service\.weibo\.com\/share\/share\.php\?/,
  );
  const bodyTop = await page
    .locator("article > div.prose")
    .evaluate((element) => element.getBoundingClientRect().top);
  const factsTop = await page
    .locator('section[aria-labelledby="key-facts"]')
    .evaluate((element) => element.getBoundingClientRect().top);
  const shareTop = await page
    .locator('section[aria-labelledby="share-heading"]')
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(bodyTop).toBeLessThan(factsTop);
  expect(factsTop).toBeLessThan(shareTop);
  await page.goto("/content/express-entry/");
  await expect(page.getByRole("heading", { name: "分享本文" })).toBeVisible();
  const contentBodyTop = await page
    .locator("article > div.prose")
    .evaluate((element) => element.getBoundingClientRect().top);
  const contentFactsTop = await page
    .locator('section[aria-labelledby="key-facts"]')
    .evaluate((element) => element.getBoundingClientRect().top);
  const contentShareTop = await page
    .locator('section[aria-labelledby="share-heading"]')
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(contentBodyTop).toBeLessThan(contentFactsTop);
  expect(contentFactsTop).toBeLessThan(contentShareTop);
});

test("sharing controls provide browser fallbacks and feedback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });
  });
  await page.goto("/news/express-entry-physicians-draw-september-2026/");
  await page.getByRole("button", { name: "系统分享" }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText("当前浏览器不支持系统分享");
  await page.getByRole("button", { name: "复制链接" }).click();
  await expect(page.locator('[aria-live="polite"]')).toHaveText("链接已复制。");
});

test("cancelling native sharing is silent", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: () => Promise.reject(new DOMException("cancelled", "AbortError")),
    });
  });
  await page.goto("/news/express-entry-physicians-draw-september-2026/");
  await page.getByRole("button", { name: "系统分享" }).click();
  await expect(page.locator('[aria-live="polite"]')).toHaveText("");
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
