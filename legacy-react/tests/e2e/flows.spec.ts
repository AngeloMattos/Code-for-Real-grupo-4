import { test, expect } from "@playwright/test";
async function navigate(page: any, label: string) {
  await page
    .locator("nav")
    .getByRole("button", { name: label, exact: false })
    .click();
}
test("all accounting pages render without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bom dia, Carlos" }),
  ).toBeVisible();
  await expect(page.locator(".metric-card").first()).toContainText("26");
  for (const n of [
    "Pendências",
    "Fechamento",
    "Empresas",
    "Funcionários",
    "Mensagens",
    "Holerites",
    "Central de alertas",
    "Visão geral",
  ]) {
    await navigate(page, n);
    await expect(page.locator("main h1").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("filters, search and sorting genuinely change the results", async ({
  page,
}) => {
  await page.goto("/");
  await navigate(page, "Pendências");
  await page
    .getByRole("textbox", { name: "Pesquisar pendência, pessoa ou empresa..." })
    .fill("P019");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Confirmar horas extras");
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await page.getByLabel("Filtrar empresa").selectOption("E2");
  await expect(page.locator("tbody tr")).toHaveCount(11);
  await page.getByLabel("Filtrar status").selectOption("resolvida");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("P012");
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await page.getByRole("checkbox", { name: "Somente bloqueadores" }).check();
  await expect(page.locator("tbody tr")).toHaveCount(9);
  await page.getByLabel("Ordenar pendências").selectOption("prazo");
  await expect(page.locator("tbody tr").first()).toContainText("P019");
  await page
    .getByRole("textbox", { name: "Pesquisar pendência, pessoa ou empresa..." })
    .fill("inexistente");
  await expect(
    page.getByText("Nenhuma pendência encontrada com esses filtros."),
  ).toBeVisible();
});
test("Marina follows P001 ↔ P002, replies, and compares her actual payslips", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Trocar perfil").selectOption("funcionario");
  await expect(
    page.getByRole("heading", { name: "Olá, Marina" }),
  ).toBeVisible();
  await expect(
    page.locator("nav").getByRole("button", { name: "Empresas" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Abrir P001", exact: true })
    .first()
    .click();
  await expect(page.locator("dialog")).toContainText("Valdir Machado");
  await page
    .getByRole("button", { name: "Abrir pendência relacionada", exact: false })
    .click();
  await expect(page.locator("dialog h1")).toContainText("Atestado de 15/09");
  await page
    .getByRole("button", { name: "Abrir pendência relacionada", exact: false })
    .click();
  await expect(page.locator("dialog h1")).toContainText("Por que meu salário");
  await page
    .getByLabel("Adicionar resposta", { exact: true })
    .fill("Gostaria de acompanhar a devolução do desconto.");
  await page
    .getByRole("button", { name: "Enviar resposta", exact: true })
    .click();
  await expect(page.locator(".message-timeline")).toContainText(
    "Gostaria de acompanhar a devolução",
  );
  await page.getByRole("button", { name: "Resumir conversa" }).click();
  await expect(page.locator(".conversation-summary")).toContainText(
    "Valdir Machado",
  );
  await page
    .getByRole("button", { name: "Comparar holerites de agosto e setembro" })
    .click();
  await expect(page.locator(".comparison-banner")).toContainText("128,80");
  await expect(page.locator(".payslip-table")).toContainText(
    "DSR sobre faltas",
  );
  await page.getByLabel("Selecionar competência").selectOption("2026-08");
  await expect(page.locator(".payslip-metrics")).toContainText("1.811,00");
});
test("new request exists only in memory and is scoped to Marina", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Trocar perfil").selectOption("funcionario");
  await page
    .getByRole("button", { name: "+ Nova solicitação", exact: true })
    .click();
  await page
    .getByLabel("Assunto", { exact: true })
    .fill("Acompanhar meu pedido");
  await page
    .getByLabel("Descrição", { exact: true })
    .fill("Solicitação criada durante o teste do protótipo.");
  await page
    .getByLabel("Competência relacionada (opcional)")
    .selectOption("2026-10");
  await page.getByRole("button", { name: "Criar solicitação" }).click();
  await expect(page.locator("tbody")).toContainText("TEMP-1");
  await expect(page.locator("tbody")).toContainText("Acompanhar meu pedido");
  await page.reload();
  await page.getByLabel("Trocar perfil").selectOption("funcionario");
  await navigate(page, "Pendências");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.locator("tbody")).not.toContainText("TEMP-1");
});
test("RH confirms P019, updates metrics, and can reopen the blocker", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Modo demonstração" }).click();
  await page
    .locator(".demo-cases>div")
    .nth(1)
    .getByRole("button", { name: "Iniciar demonstração" })
    .click();
  await expect(page.getByLabel("Trocar perfil")).toHaveValue("rh");
  await expect(page.getByLabel("Selecionar empresa")).toHaveValue("E3");
  await expect(page.locator(".closing-block")).toContainText(
    "Processamento bloqueado",
  );
  await expect(page.locator(".closing-step.blocked")).toContainText(
    "Processamento",
  );
  await page
    .getByRole("button", { name: "Resolver bloqueio", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar horas", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar resolução" }).click();
  await expect(page.locator(".detail-metadata")).toContainText("Resolvida");
  await expect(page.locator(".message-timeline")).toContainText(
    "RH confirmou as 22h extras",
  );
  await page.getByRole("button", { name: "Fechar painel" }).click();
  await expect(page.locator(".closing-block")).toHaveCount(0);
  await expect(page.locator(".closing-step.blocked")).toHaveCount(0);
  await navigate(page, "Visão geral");
  await expect(page.locator(".metric-card").nth(2)).toContainText("0");
  await expect(page.locator(".critical-banner")).toHaveCount(0);
  await navigate(page, "Pendências");
  await page.getByRole("button", { name: "Abrir P019", exact: true }).click();
  await page.getByRole("button", { name: "Reabrir pendência" }).click();
  await page.getByRole("button", { name: "Fechar painel" }).click();
  await navigate(page, "Fechamento");
  await expect(page.locator(".closing-block")).toBeVisible();
});
test("forwarding, changing owner, status and resolving keep the history", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Trocar perfil").selectOption("rh");
  await navigate(page, "Pendências");
  await page.getByRole("button", { name: "Abrir P015", exact: true }).click();
  await expect(page.locator(".journey")).toContainText("Lucas");
  await expect(page.locator(".journey")).toContainText("Ana Paula");
  await page
    .getByRole("button", { name: "Encaminhar ao RH", exact: true })
    .click();
  await expect(page.locator(".detail-metadata")).toContainText(
    "Ana Paula Krüger",
  );
  await page.getByLabel("Alterar responsável").selectOption("contabilidade");
  await expect(page.locator(".detail-metadata")).toContainText(
    "Carlos Eduardo Sens",
  );
  await page.getByLabel("Alterar status").selectOption("aberta");
  await expect(page.locator(".detail-metadata")).toContainText("Aberta");
  await page
    .getByRole("button", { name: "Resolver pendência", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator(".detail-metadata")).toContainText("Aberta");
  await page
    .getByRole("button", { name: "Resolver pendência", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar resolução" }).click();
  await expect(page.locator(".detail-metadata")).toContainText("Resolvida");
  await expect(page.locator(".message-timeline")).toContainText(
    "Encaminhada para RH",
  );
});
test("company detail, employee search and profile use dataset records", async ({
  page,
}) => {
  await page.goto("/");
  await navigate(page, "Empresas");
  await page
    .getByRole("button", { name: "Abrir Malharia Fio Azul", exact: true })
    .click();
  await expect(page.locator(".info-card")).toContainText("Ana Paula Krüger");
  await page
    .locator(".standalone")
    .getByRole("button", { name: "Funcionários", exact: true })
    .click();
  await page
    .getByRole("textbox", {
      name: "Pesquisar nome, cargo, setor ou empresa...",
    })
    .fill("Lucas");
  await expect(page.locator(".employee-card")).toHaveCount(1);
  await page.locator(".employee-card").click();
  await expect(page.locator(".employee-profile")).toContainText(
    "Lucas Batista",
  );
  await expect(page.locator("tbody")).toContainText("P015");
  await expect(
    page.getByText(
      "Não há holerites disponíveis para este funcionário no dataset.",
    ),
  ).toBeVisible();
});
test("inbox and notifications open the corresponding request", async ({
  page,
}) => {
  await page.goto("/");
  await navigate(page, "Mensagens");
  await page
    .getByRole("textbox", { name: "Pesquisar nas conversas..." })
    .fill("P001");
  await expect(page.locator(".inbox-row")).toHaveCount(1);
  await page.locator(".inbox-row").click();
  await expect(page.locator("dialog h1")).toContainText("Por que meu salário");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Notificações" }).click();
  await page.locator(".alert-card").filter({ hasText: "P019" }).click();
  await expect(page.locator("dialog h1")).toContainText(
    "Confirmar horas extras",
  );
});
test("RH company change scopes requests and payslips", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Trocar perfil").selectOption("rh");
  await navigate(page, "Holerites");
  await expect(
    page.getByText("Não há holerites disponíveis", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Selecionar empresa").selectOption("E1");
  await expect(page.locator(".payslip-heading")).toContainText("Marina Souza");
  await page.getByLabel("Selecionar empresa").selectOption("E4");
  await expect(page.locator(".payslip-heading")).toContainText(
    "Bruno Schneider",
  );
  await navigate(page, "Pendências");
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await expect(page.locator("tbody")).not.toContainText("Marina Souza");
});
test("mobile navigation, dialogs, tables and vertical timeline stay usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Abrir navegação" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await navigate(page, "Fechamento");
  await page.getByLabel("Selecionar empresa").selectOption("E3");
  const box = await page.locator(".closing-step").first().boundingBox();
  const next = await page.locator(".closing-step").nth(1).boundingBox();
  expect(next!.y).toBeGreaterThan(box!.y + 80);
  await page
    .getByRole("button", { name: "Resolver bloqueio", exact: true })
    .click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: "tests/screenshots/mobile-closing.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await navigate(page, "Pendências");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
