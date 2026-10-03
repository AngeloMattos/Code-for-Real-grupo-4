import { useMemo, useState } from "react";
import { Filter, Plus, RotateCcw } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  active,
  blocker,
  daysTo,
  isCritical,
  priority,
  roles,
  statusLabels,
  typeLabels,
} from "../lib/domain";
import { PendingTable } from "../components/PendingTable";
import { PageHeading, SearchInput } from "../components/ui";
import { NewRequest } from "../components/NewRequest";
export function Pendencies() {
  const { data, role, items } = useApp();
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [responsible, setResponsible] = useState("");
  const [type, setType] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tab, setTab] = useState("todas");
  const [sort, setSort] = useState("urgencia");
  const [blockOnly, setBlockOnly] = useState(false);
  const [newRequest, setNewRequest] = useState(false);
  const filtered = useMemo(
    () =>
      items
        .filter((p) => {
          const text = [
            p.id,
            p.titulo,
            p.descricao,
            data.empresas.find((c) => c.id === p.empresa_id)?.nome,
            data.funcionarios.find((e) => e.id === p.funcionario_id)?.nome,
          ]
            .join(" ")
            .toLocaleLowerCase("pt-BR");
          return (
            text.includes(search.toLocaleLowerCase("pt-BR")) &&
            (!company || p.empresa_id === company) &&
            (!status || p.status === status) &&
            (!responsible || p.responsavel === responsible) &&
            (!type || p.tipo === type) &&
            (!blockOnly || blocker(p)) &&
            (!deadline ||
              (deadline === "sem"
                ? p.prazo === null
                : active(p) &&
                  (deadline === "atrasadas"
                    ? daysTo(p.prazo) < 0
                    : daysTo(p.prazo) <= 3))) &&
            (tab === "todas" ||
              (tab === "criticas" && isCritical(p)) ||
              (tab === "bloqueadores" && blocker(p)) ||
              (tab === "proximas" && active(p) && daysTo(p.prazo) <= 3) ||
              (tab === "resolvidas" && !active(p)))
          );
        })
        .sort((a, b) =>
          sort === "urgencia"
            ? priority(b) - priority(a)
            : sort === "prazo"
              ? daysTo(a.prazo) - daysTo(b.prazo)
              : sort === "empresa"
                ? a.empresa_id.localeCompare(b.empresa_id)
                : sort === "status"
                  ? a.status.localeCompare(b.status)
                  : b.criada_em.localeCompare(a.criada_em),
        ),
    [
      items,
      data,
      search,
      company,
      status,
      responsible,
      type,
      deadline,
      tab,
      sort,
      blockOnly,
    ],
  );
  const reset = () => {
    setSearch("");
    setCompany("");
    setStatus("");
    setResponsible("");
    setType("");
    setDeadline("");
    setTab("todas");
    setBlockOnly(false);
  };
  return (
    <>
      <PageHeading
        title={
          role === "funcionario"
            ? "Minhas solicitações"
            : "Central de pendências"
        }
        description="Um dono, um prazo e um histórico. Nenhuma conversa fica para trás."
      >
        {role === "funcionario" && (
          <button
            className="primary-button"
            onClick={() => setNewRequest(true)}
          >
            <Plus size={16} />
            Nova solicitação
          </button>
        )}
      </PageHeading>
      <div className="panel pendencies-panel">
        <div className="tabs">
          {[
            ["todas", "Todas", items.length],
            ["criticas", "Críticas", items.filter(isCritical).length],
            ["bloqueadores", "Bloqueadores", items.filter(blocker).length],
            [
              "proximas",
              "Vencendo em breve",
              items.filter((p) => active(p) && daysTo(p.prazo) <= 3).length,
            ],
            [
              "resolvidas",
              "Resolvidas",
              items.filter((p) => !active(p)).length,
            ],
          ].map(([id, label, n]) => (
            <button
              key={id}
              className={tab === id ? "selected" : ""}
              onClick={() => setTab(String(id))}
            >
              {label}
              <span>{n}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar pendência, pessoa ou empresa..."
          />
          {role === "contabilidade" && (
            <select
              aria-label="Filtrar empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">Todas as empresas</option>
              {data.empresas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label="Filtrar status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar responsável"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          >
            <option value="">Todos os responsáveis</option>
            {Object.entries(roles).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar tipo"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar prazo"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          >
            <option value="">Todos os prazos</option>
            <option value="breve">Próximos 3 dias</option>
            <option value="atrasadas">Atrasadas</option>
            <option value="sem">Sem prazo</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={blockOnly}
              onChange={(e) => setBlockOnly(e.target.checked)}
            />
            <Filter size={13} />
            Somente bloqueadores
          </label>
          <button className="text-button" onClick={reset}>
            <RotateCcw size={13} />
            Limpar filtros
          </button>
        </div>
        <div className="results-line">
          <span>
            {filtered.length}{" "}
            {filtered.length === 1
              ? "pendência encontrada"
              : "pendências encontradas"}
          </span>
          <label>
            Ordenar por{" "}
            <select
              aria-label="Ordenar pendências"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="urgencia">Urgência</option>
              <option value="prazo">Prazo</option>
              <option value="empresa">Empresa</option>
              <option value="status">Status</option>
              <option value="criacao">Data de criação</option>
            </select>
          </label>
        </div>
        <PendingTable items={filtered} />
      </div>
      {newRequest && <NewRequest onClose={() => setNewRequest(false)} />}
    </>
  );
}
