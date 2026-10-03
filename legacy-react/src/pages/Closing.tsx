import { ClosingTimeline } from "../components/ClosingTimeline";
import {
  Check,
  CircleAlert,
  LockKeyhole,
  ArrowRight,
  Clock3,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { blocker, closingFor, date, progress } from "../lib/domain";
import {
  Badge,
  CompanySelector,
  PageHeading,
  SectionHeading,
} from "../components/ui";
import { PendingTable } from "../components/PendingTable";
export function Closing() {
  const { data, companyId, items, openPending } = useApp();
  const company = data.empresas.find((c) => c.id === companyId)!;
  const closing = closingFor(company, data);
  const blockers = items.filter(
    (p) => p.empresa_id === companyId && blocker(p),
  );
  return (
    <>
      <PageHeading
        title="Fechamento da folha"
        description="Saiba em qual etapa estamos e o que falta para avançar."
      >
        <CompanySelector />
      </PageHeading>
      <div className="panel closing-panel">
        <div className="closing-heading">
          <div>
            <span className="eyebrow">OUTUBRO / 2026</span>
            <h2>{company.nome}</h2>
            <p>{company.rh_nome} · RH responsável</p>
          </div>
          <div>
            <Badge tone={closing.status === "bloqueado" ? "red" : "blue"}>
              {closing.status === "bloqueado"
                ? "Fechamento bloqueado"
                : "Em andamento"}
            </Badge>
            <strong>
              {progress(closing)}% <small>concluído</small>
            </strong>
          </div>
        </div>
        <ClosingTimeline companyId={companyId} />
        {closing.status === "bloqueado" && (
          <div className="closing-block">
            <CircleAlert size={22} />
            <div>
              <h3>Processamento bloqueado</h3>
              <p>{closing.bloqueio}</p>
              <span>
                Aguardando confirmação das horas extras do Thiago Moretti.
              </span>
            </div>
            <button
              className="danger-button"
              onClick={() => openPending("P019")}
            >
              Resolver bloqueio
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="closing-facts">
        <div>
          <Clock3 size={19} />
          <div>
            <span>Prazo de envio do RH</span>
            <strong>{date(company.prazo_envio_rh)}</strong>
          </div>
        </div>
        <div>
          <Check size={19} />
          <div>
            <span>Pagamento do salário</span>
            <strong>{date(company.data_pagamento_salario)}</strong>
          </div>
        </div>
        <div>
          <LockKeyhole size={19} />
          <div>
            <span>Pendências que bloqueiam</span>
            <strong>{blockers.length}</strong>
          </div>
        </div>
      </div>
      <div className="panel">
        <SectionHeading
          title="O que precisa ser resolvido"
          subtitle="Itens em aberto que podem impedir o fechamento desta empresa."
        />
        <PendingTable items={blockers} />
      </div>
    </>
  );
}
