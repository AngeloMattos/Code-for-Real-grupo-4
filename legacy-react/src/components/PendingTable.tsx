import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { blocker, date, lastActivity, owner, typeLabels } from "../lib/domain";
import { DeadlineBadge, Empty, StatusBadge } from "./ui";
import type { Pending } from "../types";

export function PendingTable({
  items,
  compact = false,
}: {
  items: Pending[];
  compact?: boolean;
}) {
  const { data, openPending, role } = useApp();
  if (!items.length) return <Empty />;
  return (
    <div className="pending-list">
      <div className="mobile-pending-cards">
        {items.map((p) => (
          <button
            className={`mobile-pending-card ${role === "funcionario" && p.id === "P001" ? "primary-request" : ""}`}
            key={p.id}
            onClick={() => openPending(p.id)}
          >
            <span className="row-id">
              {p.id}
              {blocker(p) && (
                <span className="amber-text">
                  <LockKeyhole size={11} />
                  Bloqueia o fechamento
                </span>
              )}
              <ArrowUpRight size={15} />
            </span>
            <strong>{p.titulo}</strong>
            <span>
              {data.empresas.find((c) => c.id === p.empresa_id)?.nome}
            </span>
            <div>
              <StatusBadge p={p} />
              <DeadlineBadge p={p} />
            </div>
            <small>Próxima ação: {owner(p, data)}</small>
          </button>
        ))}
      </div>
      <div className="table-scroll desktop-pending-table">
        <table className={`pending-table ${compact ? "compact" : ""}`}>
          <thead>
            <tr>
              <th>Pendência</th>
              {!compact && <th>Empresa / funcionário</th>}
              <th>Responsável</th>
              <th>Status</th>
              <th>Prazo</th>
              {!compact && <th>Última atividade</th>}
              <th>
                <span className="sr-only">Ação</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                className={
                  role === "funcionario" && p.id === "P001"
                    ? "primary-request"
                    : ""
                }
              >
                <td>
                  <button
                    className="pending-title"
                    onClick={() => openPending(p.id)}
                  >
                    <span className="row-id">
                      {p.id}
                      {blocker(p) && (
                        <LockKeyhole size={11} className="amber-text" />
                      )}
                    </span>
                    <strong>{p.titulo}</strong>
                    <span className="small muted">
                      {compact
                        ? data.empresas.find((c) => c.id === p.empresa_id)?.nome
                        : typeLabels[p.tipo]}
                    </span>
                  </button>
                </td>
                {!compact && (
                  <td>
                    <div className="cell-stack">
                      <span>
                        {data.empresas.find((c) => c.id === p.empresa_id)?.nome}
                      </span>
                      <small>
                        {data.funcionarios.find(
                          (e) => e.id === p.funcionario_id,
                        )?.nome ?? "Documento da empresa"}
                      </small>
                    </div>
                  </td>
                )}
                <td>
                  <div className="cell-stack">
                    <span>
                      {owner(p, data).split(" ").slice(0, 2).join(" ")}
                    </span>
                    <small>
                      {p.responsavel === "rh"
                        ? "RH da empresa"
                        : p.responsavel === "contabilidade"
                          ? "Contabilidade"
                          : "Funcionário"}
                    </small>
                  </div>
                </td>
                <td>
                  <StatusBadge p={p} />
                </td>
                <td>
                  <DeadlineBadge p={p} />
                </td>
                {!compact && (
                  <td className="muted small">{date(lastActivity(p))}</td>
                )}
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Abrir ${p.id}`}
                    onClick={() => openPending(p.id)}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
