import { useState } from "react";
import { ArrowDownRight, FileText } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { money } from "../lib/domain";
import { Badge, Empty, PageHeading, SectionHeading } from "../components/ui";
export function Payslips({ employeeId }: { employeeId?: string }) {
  const { data, role, companyId, openPending } = useApp();
  const available = [
    ...new Set(
      data.holerites
        .filter((h) =>
          role === "funcionario"
            ? h.funcionario_id === "F01"
            : role === "rh"
              ? data.funcionarios.find((e) => e.id === h.funcionario_id)
                  ?.empresa_id === companyId
              : true,
        )
        .map((h) => h.funcionario_id),
    ),
  ];
  const [selected, setSelected] = useState(available[0] ?? "");
  const selectedId =
    employeeId ??
    (available.includes(selected) ? selected : (available[0] ?? ""));
  const slips = data.holerites
    .filter((h) => h.funcionario_id === selectedId)
    .sort((a, b) => a.competencia.localeCompare(b.competencia));
  const [period, setPeriod] = useState("2026-09");
  const slip = slips.find((h) => h.competencia === period) ?? slips.at(-1);
  const employee = data.funcionarios.find((e) => e.id === selectedId);
  const previous =
    slips.length > 1 ? slips[slips.indexOf(slip!) - 1] : undefined;
  const summaryLabels = [
    ["Salário base", slip?.eventos.find((e) => e.codigo === "001")?.valor ?? 0],
    ["Proventos", slip?.total_proventos ?? 0],
    ["Descontos", slip?.total_descontos ?? 0],
    ["Valor líquido", slip?.liquido ?? 0],
  ] as const;
  return (
    <>
      <PageHeading
        title="Holerites"
        description="Entenda os valores e compare competências disponíveis."
      >
        {!employeeId && role !== "funcionario" && (
          <select
            aria-label="Selecionar funcionário para holerite"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setPeriod("2026-09");
            }}
          >
            {available.map((id) => (
              <option key={id} value={id}>
                {data.funcionarios.find((e) => e.id === id)!.nome}
              </option>
            ))}
          </select>
        )}
      </PageHeading>
      {slip && employee ? (
        <>
          <div className="payslip-heading">
            <div>
              <h2>{employee.nome}</h2>
              <p>
                {data.empresas.find((c) => c.id === employee.empresa_id)!.nome}{" "}
                · {employee.cargo}
              </p>
            </div>
            <label>
              Competência
              <select
                aria-label="Selecionar competência"
                value={slip.competencia}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {slips.map((h) => (
                  <option key={h.competencia} value={h.competencia}>
                    {h.competencia.split("-").reverse().join("/")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="metric-grid payslip-metrics">
            {summaryLabels.map(([l, v]) => (
              <div className="metric-card" key={l}>
                <span className="metric-label">
                  {l}
                  <FileText size={15} />
                </span>
                <strong className="money-metric">{money(v)}</strong>
                <span className="metric-sub">
                  {slip.competencia.split("-").reverse().join("/")}
                </span>
              </div>
            ))}
          </div>
          {previous && (
            <div className="comparison-banner">
              <ArrowDownRight size={25} />
              <div>
                <strong>
                  O líquido mudou {money(slip.liquido - previous.liquido)} em
                  relação a{" "}
                  {previous.competencia.split("-").reverse().join("/")}
                </strong>
                <p>Comparação aritmética entre os holerites do dataset.</p>
              </div>
              {employee.id === "F01" && (
                <button
                  className="text-button"
                  onClick={() => openPending("P001")}
                >
                  Acompanhar a dúvida
                  <ArrowDownRight size={15} />
                </button>
              )}
            </div>
          )}
          <div className="panel">
            <SectionHeading
              title="Detalhamento dos eventos"
              subtitle="Os valores abaixo vêm diretamente do holerite fornecido."
            />
            <div className="table-scroll">
              <table className="pending-table payslip-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Evento</th>
                    <th>Referência</th>
                    <th>Proventos</th>
                    <th>Descontos</th>
                  </tr>
                </thead>
                <tbody>
                  {slip.eventos.map((e) => (
                    <tr key={e.codigo}>
                      <td className="muted">{e.codigo}</td>
                      <td>{e.descricao}</td>
                      <td className="muted">{e.referencia}</td>
                      <td>{e.tipo === "provento" ? money(e.valor) : "—"}</td>
                      <td>{e.tipo === "desconto" ? money(e.valor) : "—"}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={3}>Totais</td>
                    <td className="green-text">
                      {money(slip.total_proventos)}
                    </td>
                    <td className="amber-text">
                      {money(slip.total_descontos)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {slips.length > 1 && (
            <div className="panel comparison-panel">
              <SectionHeading title="Comparação entre competências" />
              <div className="comparison-grid">
                {slips.map((h) => (
                  <div key={h.competencia}>
                    <Badge>
                      {h.competencia.split("-").reverse().join("/")}
                    </Badge>
                    <div
                      className="compare-bar"
                      style={{
                        height: `${(h.liquido / slips[0].total_proventos) * 120}px`,
                      }}
                    />
                    <strong>{money(h.liquido)}</strong>
                    <span>Líquido</span>
                    <small>
                      Proventos {money(h.total_proventos)}
                      <br />
                      Descontos {money(h.total_descontos)}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Empty text="Não há holerites disponíveis para este funcionário no dataset." />
      )}
      <p className="data-note">
        Valores fictícios do dataset para fins de demonstração. Nenhum cálculo
        trabalhista é realizado.
      </p>
    </>
  );
}
