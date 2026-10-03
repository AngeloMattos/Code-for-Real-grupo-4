import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCheck,
  Link2,
  LockKeyhole,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Users,
  Workflow,
  RotateCcw,
  FileText,
  Sparkles,
  Clock3,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  active,
  blocker,
  channelLabels,
  date,
  owner,
  REFERENCE_DATE,
  roles,
  statusLabels,
  typeLabels,
} from "../lib/domain";
import type { Channel, Pending, PendingStatus, Role } from "../types";
import { Avatar, Badge, DeadlineBadge, StatusBadge } from "./ui";
import { Overlay } from "./Overlay";
const channelIcons: Record<Channel, typeof Mail> = {
  whatsapp: MessageCircle,
  email: Mail,
  telefone: Phone,
  presencial: Users,
  rh_net: Workflow,
};
export function PendingDetails() {
  const {
    data,
    pendingId,
    closePending,
    openPending,
    role,
    companyId,
    update,
    setStatus,
    toast,
    navigate,
  } = useApp();
  const p = data.pendencias.find((p) => p.id === pendingId);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [summary, setSummary] = useState(false);
  useEffect(() => {
    setMessage("");
    setConfirm(false);
    setSummary(false);
  }, [pendingId]);
  if (!p) return null;
  const company = data.empresas.find((c) => c.id === p.empresa_id)!;
  const employee = data.funcionarios.find((e) => e.id === p.funcionario_id);
  const actor =
    role === "contabilidade"
      ? data.escritorio.responsavel_dp.nome
      : role === "rh"
        ? data.empresas.find((c) => c.id === companyId)!.rh_nome
        : "Marina Souza";
  const linked = data.pendencias.filter((x) => p.relacionada_a?.includes(x.id));
  const nextAction =
    p.status === "resolvida"
      ? "Nenhuma ação pendente."
      : p.id === "P019"
        ? "Confirmar as 22h extras do Thiago Moretti."
        : `${owner(p, data)} precisa analisar e responder esta solicitação.`;
  function log(text: string, patch: Partial<Pending> = {}) {
    update(p!.id, {
      ...patch,
      historico: [
        ...p!.historico,
        {
          data: REFERENCE_DATE,
          autor: actor,
          papel: role,
          canal: "rh_net",
          mensagem: text,
        },
      ],
    });
  }
  function forward(r: Role) {
    log(`[Simulação] Encaminhada para ${roles[r]}.`, {
      responsavel: r,
      status: `aguardando_${r}`,
      resolvida_em: null,
    });
    toast(`Pendência encaminhada para ${roles[r]}.`);
  }
  function resolve() {
    log(
      p!.id === "P019" && role === "rh"
        ? "[Simulação] RH confirmou as 22h extras do mutirão de Thiago Moretti."
        : "[Simulação] Pendência marcada como resolvida.",
    );
    setStatus(p!.id, "resolvida");
    setConfirm(false);
  }
  return (
    <>
      <Overlay drawer title={`Pendências / ${p.id}`} onClose={closePending}>
        <div className="detail-body">
          <div className="detail-kicker">
            <span>{p.id}</span>
            <Badge tone="neutral">{typeLabels[p.tipo]}</Badge>
            {blocker(p) && (
              <Badge tone="red">
                <LockKeyhole size={11} />
                Bloqueia o fechamento
              </Badge>
            )}
          </div>
          <h1>{p.titulo}</h1>
          <p className="detail-description">{p.descricao}</p>
          <div className="detail-people">
            <Avatar name={employee?.nome ?? company.nome} />
            <div>
              <strong>{employee?.nome ?? company.nome}</strong>
              <span>
                {company.nome}
                {employee ? ` · ${employee.cargo}` : ""}
              </span>
            </div>
          </div>
          <div className="detail-metadata">
            <div>
              <span>Status atual</span>
              <StatusBadge p={p} />
            </div>
            <div>
              <span>Próximo responsável</span>
              <strong>{owner(p, data)}</strong>
            </div>
            <div>
              <span>Prazo</span>
              <DeadlineBadge p={p} />
              <small>{date(p.prazo)}</small>
            </div>
            <div>
              <span>Criada em / origem</span>
              <strong>{date(p.criada_em)}</strong>
              <small>{channelLabels[p.canal_origem]}</small>
            </div>
          </div>
          <div className="journey">
            <span>{employee?.nome.split(" ")[0] ?? "Empresa"}</span>
            <ArrowRight size={14} />
            <span className={p.responsavel === "rh" ? "current" : ""}>
              {company.rh_nome.split(" ").slice(0, 2).join(" ")} / RH
            </span>
            <ArrowRight size={14} />
            <span
              className={p.responsavel === "contabilidade" ? "current" : ""}
            >
              Carlos / Contabilidade
            </span>
          </div>
          <div className="next-action">
            <Clock3 size={17} />
            <div>
              <strong>
                {active(p)
                  ? "Próxima ação necessária"
                  : "Solicitação encerrada"}
              </strong>
              <p>
                {active(p)
                  ? nextAction
                  : "O histórico continua disponível para consulta."}
              </p>
            </div>
          </div>
          {linked.map((l) => (
            <button
              key={l.id}
              className="related-pending"
              onClick={() => openPending(l.id)}
            >
              <Link2 size={19} />
              <div>
                <small>
                  {p.id === "P001"
                    ? "Possível causa relacionada"
                    : "Solicitação relacionada"}
                </small>
                <strong>
                  {l.id} · {l.titulo}
                </strong>
                <span>Abrir pendência relacionada</span>
              </div>
              <ArrowRight size={17} />
            </button>
          ))}
          {employee?.id === "F01" && (
            <button
              className="text-button salary-link"
              onClick={() => {
                closePending();
                navigate("holerites");
              }}
            >
              <FileText size={15} />
              Comparar holerites de agosto e setembro
              <ArrowRight size={14} />
            </button>
          )}
          <div className="history-heading">
            <h2>
              Histórico da conversa <span>{p.historico.length}</span>
            </h2>
            <button
              className="text-button"
              onClick={() => setSummary(!summary)}
            >
              <Sparkles size={14} />
              {summary ? "Ocultar resumo" : "Resumir conversa"}
            </button>
          </div>
          {summary && (
            <div className="conversation-summary">
              <h3>Resumo do histórico</h3>
              <small>
                Resumo demonstrativo, gerado localmente a partir dos registros.
              </small>
              <dl>
                <dt>Situação atual</dt>
                <dd>{statusLabels[p.status]}</dd>
                <dt>Última ação</dt>
                <dd>{p.historico.at(-1)?.mensagem ?? "Sem mensagens."}</dd>
                <dt>Responsável atual</dt>
                <dd>{owner(p, data)}</dd>
                <dt>Próxima ação</dt>
                <dd>{nextAction}</dd>
                <dt>Prazo</dt>
                <dd>{date(p.prazo)}</dd>
              </dl>
            </div>
          )}
          <div className="message-timeline">
            {p.historico.map((m, i) => {
              const Icon = channelIcons[m.canal];
              return (
                <article className="message" key={`${p.id}-${i}`}>
                  <Avatar name={m.autor} />
                  <div>
                    <div className="message-header">
                      <strong>{m.autor}</strong>
                      <Badge tone="neutral">{roles[m.papel]}</Badge>
                      <time>{date(m.data)}</time>
                    </div>
                    <p>{m.mensagem}</p>
                    <span className="message-channel">
                      <Icon size={11} />
                      {channelLabels[m.canal]}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          <form
            className="reply-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return;
              log(message.trim());
              setMessage("");
              toast("Resposta adicionada ao histórico.");
            }}
          >
            <label htmlFor="reply">Adicionar resposta</label>
            <textarea
              id="reply"
              placeholder="Escreva uma resposta para manter todos informados..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <div>
              <span>Como {actor} · Apenas nesta demonstração</span>
              <button
                className="primary-button"
                type="submit"
                disabled={!message.trim()}
              >
                <Send size={14} />
                Enviar resposta
              </button>
            </div>
          </form>
          {role !== "funcionario" && (
            <div className="pending-actions">
              <h3>Ações da pendência</h3>
              <div className="action-selects">
                <label>
                  Responsável
                  <select
                    aria-label="Alterar responsável"
                    value={p.responsavel}
                    onChange={(e) => forward(e.target.value as Role)}
                  >
                    {Object.entries(roles).map(([k, v]) => (
                      <option
                        key={k}
                        value={k}
                        disabled={k === "funcionario" && !employee}
                      >
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    aria-label="Alterar status"
                    value={p.status}
                    onChange={(e) => {
                      const s = e.target.value as PendingStatus;
                      if (s === "resolvida") setConfirm(true);
                      else {
                        log(
                          `[Simulação] Status alterado para ${statusLabels[s]}.`,
                        );
                        setStatus(p.id, s);
                      }
                    }}
                  >
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option
                        key={k}
                        value={k}
                        disabled={k === "aguardando_funcionario" && !employee}
                      >
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {active(p) ? (
                <>
                  <div className="action-buttons">
                    <button
                      className="secondary-button"
                      onClick={() => forward("rh")}
                    >
                      Encaminhar ao RH
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => forward("contabilidade")}
                    >
                      Encaminhar à contabilidade
                    </button>
                    <button
                      className="secondary-button"
                      disabled={!employee}
                      onClick={() => forward("funcionario")}
                    >
                      Solicitar informação ao funcionário
                    </button>
                  </div>
                  <button
                    className="success-button"
                    onClick={() => setConfirm(true)}
                  >
                    <CheckCheck size={16} />
                    {p.id === "P019" && role === "rh"
                      ? "Confirmar horas"
                      : "Resolver pendência"}
                  </button>
                </>
              ) : (
                <button
                  className="secondary-button"
                  onClick={() => {
                    log("[Simulação] Pendência reaberta.");
                    setStatus(p.id, "aberta");
                  }}
                >
                  <RotateCcw size={14} />
                  Reabrir pendência
                </button>
              )}
            </div>
          )}
        </div>
      </Overlay>
      {confirm && (
        <Overlay
          title={
            p.id === "P019" && role === "rh"
              ? "Confirmar as horas extras"
              : "Resolver pendência"
          }
          onClose={() => setConfirm(false)}
        >
          <div className="modal-body">
            <CheckCheck className="green-text" size={30} />
            <h2>
              {p.id === "P019" && role === "rh"
                ? "Confirmar as 22h extras de Thiago Moretti?"
                : "Marcar esta pendência como resolvida?"}
            </h2>
            <p>
              {p.id === "P019"
                ? "O processamento da clínica deixará de aparecer como bloqueado."
                : "A pendência sairá das prioridades e ficará no histórico."}{" "}
              Esta ação vale somente nesta demonstração.
            </p>
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setConfirm(false)}
              >
                Cancelar
              </button>
              <button className="success-button" onClick={resolve}>
                Confirmar resolução
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}
