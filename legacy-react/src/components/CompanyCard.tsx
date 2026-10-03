import { ArrowUpRight, Building2, LockKeyhole, Users } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  active,
  blocker,
  closingFor,
  progress,
  shortDate,
  stageLabels,
} from "../lib/domain";
import { Badge } from "./ui";
import type { Company } from "../types";
export function CompanyCard({ company: c }: { company: Company }) {
  const { data, navigate, setCompanyId, setCompanyDetail, openPending } =
    useApp();
  const items = data.pendencias.filter((p) => p.empresa_id === c.id);
  const count = items.filter(active).length;
  const blockers = items.filter(blocker).length;
  const closing = closingFor(c, data);
  const blocked = closing.status === "bloqueado";
  const pct = progress(closing);
  const stage = closing.etapas.find((s) => s.status === "em_andamento");
  return (
    <article className={`company-card ${blocked ? "blocked" : ""}`}>
      <div className="company-card-top">
        <span className={`company-icon color-${c.id}`}>
          <Building2 size={20} />
        </span>
        <button
          className="icon-button"
          aria-label={`Abrir ${c.nome}`}
          onClick={() => {
            navigate("empresas");
            setCompanyDetail(c.id);
          }}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
      <h3>{c.nome}</h3>
      <p className="small muted">
        <Users size={13} />
        {c.qtd_funcionarios} funcionários<span>·</span>
        {c.segmento.split("/")[0]}
      </p>
      <Badge tone={blocked ? "red" : blockers ? "amber" : "blue"}>
        <span className="dot" />
        {blocked
          ? "Fechamento bloqueado"
          : blockers
            ? "Requer atenção"
            : "Em andamento"}
      </Badge>
      <div className="company-progress">
        <span>
          {blocked
            ? "Processamento parado"
            : stageLabels[stage?.etapa ?? "fechamento"]}
        </span>
        <strong>{pct}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="company-stats">
        <div>
          <strong>{count}</strong>
          <span>Pendências</span>
        </div>
        <div>
          <strong className={blockers ? "amber-text" : ""}>{blockers}</strong>
          <span>Bloqueadores</span>
        </div>
        <div>
          <strong>{shortDate(c.prazo_envio_rh)}</strong>
          <span>Prazo RH</span>
        </div>
      </div>
      {blocked ? (
        <button
          className="company-footer danger-link"
          onClick={() => openPending("P019")}
        >
          <LockKeyhole size={13} />
          P019 · Confirmar horas extras
          <ArrowUpRight size={13} />
        </button>
      ) : (
        <button
          className="company-footer"
          onClick={() => {
            setCompanyId(c.id);
            navigate("fechamento");
          }}
        >
          Acompanhar fechamento
          <ArrowUpRight size={13} />
        </button>
      )}
    </article>
  );
}
