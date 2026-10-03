import {
  ArrowRight,
  Building2,
  CircleAlert,
  ClipboardList,
  Clock3,
  LockKeyhole,
  CheckCheck,
  FileText,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  active,
  blocker,
  closingFor,
  daysTo,
  money,
  priority,
  roles,
} from "../lib/domain";
import { CompanyCard } from "../components/CompanyCard";
import { PendingTable } from "../components/PendingTable";
import { ClosingTimeline } from "../components/ClosingTimeline";
import { Badge, PageHeading, SectionHeading } from "../components/ui";
export function Dashboard() {
  const { data, role, items, companyId, navigate, openPending, setCompanyId } =
    useApp();
  const companies = data.empresas.filter(
    (c) => role === "contabilidade" || c.id === companyId,
  );
  const opened = items.filter(active);
  const blockers = items.filter(blocker);
  const blocked = companies.filter(
    (c) => closingFor(c, data).status === "bloqueado",
  );
  const near = opened.filter((p) => daysTo(p.prazo) <= 3);
  const person =
    role === "funcionario"
      ? "Marina"
      : role === "rh"
        ? data.empresas.find((c) => c.id === companyId)!.rh_nome.split(" ")[0]
        : "Carlos";
  const metrics =
    role === "funcionario"
      ? [
          {
            name: "Solicitações abertas",
            value: opened.length,
            sub: "Acompanhe cada próximo passo",
            icon: ClipboardList,
            tone: "blue",
            page: "pendencias" as const,
          },
          {
            name: "Aguardando resposta",
            value: opened.filter((p) => p.responsavel !== "funcionario").length,
            sub: "Seu pedido tem um responsável",
            icon: Clock3,
            tone: "amber",
            page: "pendencias" as const,
          },
          {
            name: "Resolvidas",
            value: items.filter((p) => !active(p)).length,
            sub: "Histórico sempre disponível",
            icon: CheckCheck,
            tone: "green",
            page: "pendencias" as const,
          },
          {
            name: "Último holerite",
            value: money(
              data.holerites.filter((h) => h.funcionario_id === "F01").at(-1)!
                .liquido,
            ),
            sub: "Líquido · Setembro/2026",
            icon: FileText,
            tone: "purple",
            page: "holerites" as const,
          },
        ]
      : [
          {
            name: "Pendências abertas",
            value: opened.length,
            sub: `${items.filter((p) => !active(p)).length} resolvidas no acompanhamento`,
            icon: ClipboardList,
            tone: "blue",
            page: "pendencias" as const,
          },
          {
            name: "Bloqueadores da folha",
            value: blockers.length,
            sub: `${companies.filter((c) => blockers.some((p) => p.empresa_id === c.id)).length} empresas precisam de ação`,
            icon: LockKeyhole,
            tone: "amber",
            page: "pendencias" as const,
          },
          {
            name: "Empresas bloqueadas",
            value: blocked.length,
            sub: blocked.length
              ? "Processamento aguardando o RH"
              : "Nenhum processamento bloqueado",
            icon: Building2,
            tone: blocked.length ? "red" : "green",
            page: "fechamento" as const,
          },
          {
            name: "Prazos próximos",
            value: near.length,
            sub: "Vencimentos nos próximos 3 dias",
            icon: Clock3,
            tone: "purple",
            page: "alertas" as const,
          },
        ];
  if (role === "rh") {
    metrics[0] = {
      name: "Pendências que precisam de você",
      value: opened.filter((p) => p.responsavel === "rh").length,
      sub: "O próximo passo está com o RH",
      icon: ClipboardList,
      tone: "blue",
      page: "pendencias",
    };
    metrics[1] = {
      name: "Funcionários aguardando resposta",
      value: opened.filter(
        (p) =>
          p.aberta_por === "funcionario" && p.responsavel !== "funcionario",
      ).length,
      sub: "Solicitações em análise pelo RH / DP",
      icon: Clock3,
      tone: "amber",
      page: "pendencias",
    };
    metrics[2] = {
      name: "Itens que bloqueiam o fechamento",
      value: blockers.length,
      sub: blocked.length
        ? "Processamento aguardando o RH"
        : "Pendências em aberto da empresa",
      icon: LockKeyhole,
      tone: blocked.length ? "red" : "amber",
      page: "fechamento",
    };
  }
  return (
    <>
      <PageHeading
        title={`${role === "funcionario" ? "Olá" : "Bom dia"}, ${person}`}
        description={
          role === "funcionario"
            ? "Suas solicitações, respostas e holerites em um só lugar."
            : "Fechamento da folha — Outubro de 2026. Cada próximo passo, no lugar certo."
        }
      />
      <div className="metric-grid">
        {metrics.map((m) => (
          <button
            className="metric-card"
            key={m.name}
            onClick={() => {
              if (m.name === "Empresas bloqueadas" && blocked.length)
                setCompanyId(blocked[0].id);
              navigate(m.page);
            }}
          >
            <span className="metric-label">
              {m.name}
              <span className={`metric-icon ${m.tone}`}>
                <m.icon size={17} />
              </span>
            </span>
            <strong
              className={typeof m.value === "string" ? "money-metric" : ""}
            >
              {m.value}
            </strong>
            <span className="metric-sub">{m.sub}</span>
          </button>
        ))}
      </div>
      {blocked.length > 0 && role !== "funcionario" && (
        <div className="critical-banner">
          <span className="critical-icon">
            <CircleAlert size={23} />
          </span>
          <div>
            <div className="banner-title">
              A folha da Clínica Odonto Sorriso precisa de você{" "}
              <Badge tone="red">Bloqueada</Badge>
            </div>
            <p>
              22h extras do Thiago Moretti aguardam confirmação do RH. O
              processamento está parado.
            </p>
          </div>
          <button onClick={() => openPending("P019")}>
            Resolver bloqueio
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      {role === "funcionario" ? (
        <div className="panel">
          <SectionHeading
            title="Minhas solicitações"
            subtitle="Você sabe quem está cuidando de cada pedido."
            action="Ver todas"
            onAction={() => navigate("pendencias")}
          />
          <PendingTable items={items} compact />
        </div>
      ) : (
        <>
          <SectionHeading
            title="Situação das empresas"
            subtitle={
              role === "contabilidade"
                ? `${companies.length} empresas em acompanhamento nesta demonstração`
                : `${data.empresas.find((c) => c.id === companyId)!.rh_nome} · ${roles.rh}`
            }
            action="Ver empresas"
            onAction={() => navigate("empresas")}
          />
          <div className="company-grid">
            {companies.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        </>
      )}
      {role !== "funcionario" && (
        <div className="dashboard-bottom">
          <div className="panel priority-panel">
            <SectionHeading
              title={
                role === "rh"
                  ? "Pendências que precisam de você"
                  : "Prioridades de hoje"
              }
              subtitle="O que precisa avançar para o fechamento acontecer."
              action="Ver pendências"
              onAction={() => navigate("pendencias")}
            />
            <PendingTable
              items={[
                ...(role === "rh"
                  ? opened.filter((p) => p.responsavel === "rh")
                  : opened),
              ]
                .sort((a, b) => priority(b) - priority(a))
                .slice(0, 5)}
              compact
            />
          </div>
          <div className="panel distribution">
            <SectionHeading
              title="Com quem está a bola?"
              subtitle="Responsável pelo próximo passo"
            />
            {(["rh", "contabilidade", "funcionario"] as const).map((r) => {
              const n = opened.filter((p) => p.responsavel === r).length;
              return (
                <div className="distribution-row" key={r}>
                  <div>
                    <span className={`dot ${r}`} />
                    {roles[r]}
                    <strong>{n}</strong>
                  </div>
                  <div className="progress-track">
                    <span
                      className={r}
                      style={{
                        width: `${opened.length ? (n / opened.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="distribution-note">
              <CheckCheck size={18} />
              <p>
                Comunicação que vira ação.
                <br />
                <span>
                  Um dono, um prazo e um histórico para cada pendência.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
      {role === "rh" && (
        <div className="panel rh-dashboard-timeline">
          <SectionHeading
            title="Linha do tempo do fechamento"
            subtitle="Outubro/2026 · Etapas concluídas e próximos passos"
            action="Ver fechamento"
            onAction={() => navigate("fechamento")}
          />
          <ClosingTimeline companyId={companyId} />
        </div>
      )}
    </>
  );
}
