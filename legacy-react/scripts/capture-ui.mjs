import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "tests/screenshots";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto("http://127.0.0.1:5173/");
await page.getByRole("heading", { name: "Bom dia, Carlos" }).waitFor();
await page.screenshot({
  path: `${output}/dashboard-desktop.png`,
  fullPage: true,
});
await page
  .getByRole("button", { name: "Resolver bloqueio", exact: true })
  .first()
  .click();
await page.locator("dialog h1").waitFor();
await page.screenshot({ path: `${output}/pending-drawer.png` });
await page.keyboard.press("Escape");
await page
  .locator("nav")
  .getByRole("button", { name: "Fechamento", exact: true })
  .click();
await page.getByLabel("Selecionar empresa").selectOption("E3");
await page.locator(".closing-step.blocked").waitFor();
await page.screenshot({
  path: `${output}/closing-desktop.png`,
  fullPage: true,
});
await page.getByLabel("Trocar perfil").selectOption("funcionario");
await page
  .locator("nav")
  .getByRole("button", { name: "Holerites", exact: true })
  .click();
await page.locator(".comparison-banner").waitFor();
await page.screenshot({
  path: `${output}/payslips-desktop.png`,
  fullPage: true,
});
const widths = [];
for (const width of [820, 390, 360]) {
  await page.setViewportSize({ width, height: 900 });
  await page.getByLabel("Trocar perfil").selectOption("contabilidade");
  await page.getByRole("heading", { name: "Bom dia, Carlos" }).waitFor();
  widths.push({
    width,
    scrollWidth: await page.evaluate(
      () => document.documentElement.scrollWidth,
    ),
  });
  if (width === 390)
    await page.screenshot({ path: `${output}/dashboard-mobile.png` });
}
await browser.close();
console.log(
  JSON.stringify(
    { screenshots: output, runtimeErrors: errors, responsiveWidths: widths },
    null,
    2,
  ),
);
if (errors.length || widths.some((x) => x.scrollWidth > x.width))
  process.exitCode = 1;
