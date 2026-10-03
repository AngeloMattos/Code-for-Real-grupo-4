import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  active,
  blocker,
  closingFor,
  daysTo,
  deadline,
  owner,
  scoped,
  changeStatus,
  alertsFor,
  progress,
} from "../src/lib/domain.ts";
import type { Dataset } from "../src/types/index.ts";
const original = JSON.parse(
  readFileSync(
    new URL("../src/data/fecha-comigo.json", import.meta.url),
    "utf8",
  ),
) as Dataset;
test("canonical dataset and referential integrity", () => {
  assert.equal(original.pendencias.length, 30);
  assert.equal(original.funcionarios.length, 36);
  assert.equal(original.empresas.length, 4);
  for (const p of original.pendencias) {
    assert.ok(original.empresas.some((c) => c.id === p.empresa_id));
    if (p.funcionario_id)
      assert.ok(
        original.funcionarios.some(
          (e) => e.id === p.funcionario_id && e.empresa_id === p.empresa_id,
        ),
      );
    for (const id of p.relacionada_a ?? [])
      assert.ok(original.pendencias.some((p) => p.id === id));
  }
});
test("metrics are calculated with resolved blockers excluded", () => {
  assert.equal(original.pendencias.filter(active).length, 26);
  assert.equal(original.pendencias.filter(blocker).length, 9);
  const resolved = changeStatus(
    original.pendencias.find((p) => p.id === "P019")!,
    "resolvida",
  );
  assert.equal(blocker(resolved), false);
});
test("urgency uses 20 October 2026 and supports no deadline", () => {
  assert.equal(daysTo("2026-10-21"), 1);
  assert.equal(daysTo("2026-10-19"), -1);
  assert.equal(daysTo(null), Infinity);
  assert.equal(
    deadline(original.pendencias.find((p) => p.id === "P019")!),
    "Vence amanhã",
  );
});
test("P019 resolving unblocks the processing but does not finish the payroll", () => {
  const d = structuredClone(original);
  const c = d.empresas.find((c) => c.id === "E3")!;
  assert.equal(closingFor(c, d).status, "bloqueado");
  d.pendencias = d.pendencias.map((p) =>
    p.id === "P019" ? changeStatus(p, "resolvida") : p,
  );
  const closing = closingFor(c, d);
  assert.equal(closing.status, "em_andamento");
  assert.equal(closing.etapas[2].status, "em_andamento");
  assert.equal(progress(closing), 33);
  assert.equal(
    original.fechamentos.find(
      (f) => f.empresa_id === "E3" && f.competencia === "2026-10",
    )!.status,
    "bloqueado",
  );
});
test("reopening P019 restores the original blocker", () => {
  const d = structuredClone(original);
  d.pendencias = d.pendencias.map((p) =>
    p.id === "P019" ? changeStatus(changeStatus(p, "resolvida"), "aberta") : p,
  );
  assert.equal(closingFor(d.empresas[2], d).status, "bloqueado");
});
test("persona scoping and correct owners", () => {
  assert.deepEqual(
    scoped(original, "funcionario", "E1").map((p) => p.id),
    ["P001", "P002"],
  );
  assert.equal(scoped(original, "rh", "E2").length, 11);
  assert.equal(owner(original.pendencias[0], original), "Valdir Machado");
  assert.equal(
    owner(
      original.pendencias.find((p) => p.id === "P019")!,
      original,
    ),
    "Juliana Costa",
  );
});
test("forwarding keeps status and owner consistent", () => {
  const p = changeStatus(original.pendencias[0], "aguardando_contabilidade");
  assert.equal(p.responsavel, "contabilidade");
  assert.equal(p.resolvida_em, null);
  assert.equal(owner(p, original), "Carlos Eduardo Sens");
});
test("Marina comparison uses supplied totals, not inferred payroll calculations", () => {
  const [a, b] = original.holerites.filter((h) => h.funcionario_id === "F01");
  assert.equal(Number((b.liquido - a.liquido).toFixed(2)), -128.8);
  assert.equal(
    Number((b.total_descontos - a.total_descontos).toFixed(2)),
    128.8,
  );
  assert.equal(b.eventos.find((e) => e.codigo === "401")!.valor, 70);
});
test("resolved requests emit no outstanding alerts", () => {
  for (const p of original.pendencias.filter((p) => !active(p)))
    assert.deepEqual(alertsFor(p), []);
});
