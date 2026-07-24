import { chromium } from "playwright";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const targetUrl = process.env.BLANKLESS_URL ?? "https://blankless.vercel.app";
const runs = 5;
const viewport = { width: 1440, height: 900 };
const artifactsDir = path.resolve("artifacts");
const videoDir = path.join(artifactsDir, "video");
const screenshotsDir = path.join(artifactsDir, "screenshots");

await mkdir(videoDir, { recursive: true });
await mkdir(screenshotsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function waitForButtonEnabled(page, name) {
  await page.waitForFunction((buttonName) => {
    const button = [...document.querySelectorAll("button")].find((candidate) => candidate.textContent?.includes(buttonName));
    return button instanceof HTMLButtonElement && !button.disabled;
  }, name, { timeout: 30_000 });
}

async function rehearse(runNumber) {
  const context = await browser.newContext({
    viewport,
    recordVideo: runNumber === 1 ? { dir: videoDir, size: viewport } : undefined
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(1_000);

    await page.getByRole("button", { name: "Play Scenario 1" }).click();
    await page.waitForTimeout(1_000);
    await page.getByText("Agent Activity").scrollIntoViewIfNeeded();

    await page.getByText("1m 51s", { exact: true }).waitFor({ timeout: 30_000 });
    await waitForButtonEnabled(page, "Play Scenario 2");
    const scenario1FillTime = await page.getByText("1m 51s", { exact: true }).textContent();

    await page.getByRole("button", { name: "Play Scenario 2" }).click();
    await page.waitForTimeout(1_000);
    await page.getByText("Agent Activity").scrollIntoViewIfNeeded();

    await page.getByText("1m 25s", { exact: true }).waitFor({ timeout: 30_000 });
    await page.getByText("Policy v1 would have contacted Sofia first. Policy v2 filled this slot in 1 attempt.", { exact: true }).waitFor({ timeout: 30_000 });
    const scenario2FillTime = await page.getByText("1m 25s", { exact: true }).textContent();

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(1_000);
    await page.screenshot({
      path: path.join(screenshotsDir, `run-${runNumber}-final.png`),
      fullPage: true
    });

    results.push({ run: runNumber, scenario1FillTime, scenario2FillTime, status: "passed" });
  } catch (error) {
    await page.screenshot({
      path: path.join(screenshotsDir, `run-${runNumber}-failure.png`),
      fullPage: true
    }).catch(() => undefined);
    results.push({ run: runNumber, status: "failed", error: error instanceof Error ? error.message : String(error) });
    throw error;
  } finally {
    await context.close();
    if (video) {
      const sourcePath = await video.path();
      await rename(sourcePath, path.join(videoDir, "blankless-perfect-run.webm"));
    }
  }
}

try {
  for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
    console.log(`Starting Blankless production rehearsal ${runNumber}/${runs}`);
    await rehearse(runNumber);
    console.log(`Completed rehearsal ${runNumber}/${runs}: Scenario 1 = 1m 51s, Scenario 2 = 1m 25s`);
  }
} finally {
  await browser.close();
  await writeFile(path.join(artifactsDir, "rehearsal-results.json"), JSON.stringify(results, null, 2));
}

if (results.length !== runs || results.some((result) => result.status !== "passed")) {
  process.exitCode = 1;
}
