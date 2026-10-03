import { useState } from "react";
import {
  ArrowRight,
  Bell,
  CircleAlert,
  Inbox,
  MessageSquare,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  active,
  alertsFor,
  channelLabels,
  date,
  lastActivity,
  owner,
  priority,
  roles,
} from "../lib/domain";
import {
  Avatar,
  Badge,
  DeadlineBadge,
  Empty,
  PageHeading,
  SearchInput,
  StatusBadge,
} from "../components/ui";
export function Alerts() {
  const { data, items, openPending } = useApp();
  const alerts = [...items]
    .filter((p) => alertsFor(p).length)
    .sort((a, b) => priority(b) - priority(a));
  return (
    <>
      <PageHeading
        title="Central de alertas"
        description="Sinais dos dados para ajudar você a agir na hora certa."
      />
      <div className="alerts-intro">
        <Bell size={22} />
        <div>
          <strong>{alerts.length} pendências precisam de atenção</strong>
          <p>Alertas calculados com a referência fixa de 20/10/2026.</p>
        </div>
      </div>
      <div className="alerts-list">
        {alerts.length ? (
          alerts.map((p) => (
            <button
              key={p.id}
              className={`alert-card panel ${p.id === "P019" ? "critical" : ""}`}
              onClick={() => openPending(p.id)}
            >
              <span className="alert-icon">
                <CircleAlert size={20} />
              </span>
              <div>
                <div className="alert-tags">
                  {alertsFor(p).map((label) => (
                    <Badge
                      key={label}
                      tone={
                        label === "Prioridade crítica"
                          ? "red"
                          : label.includes("Bloqueia")
                            ? "amber"
                            : "blue"
                      }
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
                <h3>
                  {p.id} · {p.titulo}
                </h3>
                <p>
                  {data.empresas.find((c) => c.id === p.empresa_id)!.nome} ·
                  Próxima ação: {owner(p, data)}
                </p>
                <span className="small muted">
                  Última atividade: {date(lastActivity(p))}
                </span>
              </div>
              <DeadlineBadge p={p} />
              <ArrowRight size={17} />
            </button>
          ))
        ) : (
          <Empty text="Nenhum alerta para esta visão." />
        )}
      </div>
    </>
  );
}
export function Messages() {
  const { data, items, role, openPending } = useApp();
  const [filter, setFilter] = useState("todas");
  const [channel, setChannel] = useState("");
  const [search, setSearch] = useState("");
  const list = [...items]
    .filter(
      (p) =>
        (filter === "todas" ||
          (filter === "sem" &&
            active(p) &&
            p.historico.at(-1)?.papel === "funcionario") ||
          p.responsavel === filter) &&
        (!channel || p.historico.some((m) => m.canal === channel)) &&
        [p.id, p.titulo, ...p.historico.map((m) => m.mensagem)]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => lastActivity(b).localeCompare(lastActivity(a)));
  return (
    <>
      <PageHeading
        title="Mensagens"
        description="WhatsApp, e-mail e RH Net: o contexto inteiro em uma conversa."
      />
      <div className="panel inbox">
        <div className="filter-bar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar nas conversas..."
          />
          <select
            aria-label="Filtrar conversas"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="todas">Todas as conversas</option>
            <option value="sem">Não respondidas ao funcionário</option>
            {Object.entries(roles)
              .filter(([k]) => role !== "funcionario" || k !== "funcionario")
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </select>
          <select
            aria-label="Filtrar canal"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="">Todos os canais</option>
            {Object.entries(channelLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="inbox-label">
          <Inbox size={15} />
          {list.length} conversas organizadas por pendência
        </div>
        {list.length ? (
          list.map((p) => {
            const last = p.historico.at(-1);
            return (
              <button
                className="inbox-row"
                key={p.id}
                onClick={() => openPending(p.id)}
              >
                <Avatar name={last?.autor ?? p.titulo} />
                <div>
                  <div className="inbox-title">
                    <strong>{last?.autor}</strong>
                    <span>{date(lastActivity(p))}</span>
                  </div>
                  <h3>
                    {p.id} · {p.titulo}
                  </h3>
                  <p>{last?.mensagem}</p>
                  <span className="message-channel">
                    <MessageSquare size={12} />
                    {
                      data.empresas.find((c) => c.id === p.empresa_id)!.nome
                    } · {last ? channelLabels[last.canal] : ""}
                  </span>
                </div>
                <StatusBadge p={p} />
                <ArrowRight size={16} />
              </button>
            );
          })
        ) : (
          <Empty text="Nenhuma conversa encontrada com esses filtros." />
        )}
      </div>
    </>
  );
}
