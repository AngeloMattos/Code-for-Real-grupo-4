import type {
  Closing,
  Company,
  Dataset,
  Pending,
  PendingStatus,
  Role,
} from "../types/index.ts";
export const REFERENCE_DATE = "2026-10-20";
export const CURRENT_PERIOD = "2026-10";
export const roles: Record<Role, string> = {
  funcionario: "Funcionário",
  rh: "RH",
  contabilidade: "Contabilidade",
};
export const statusLabels: Record<PendingStatus, string> = {
  aberta: "Aberta",
  aguardando_funcionario: "Aguardando funcionário",
  aguardando_rh: "Aguardando o RH",
  aguardando_contabilidade: "Aguardando contabilidade",
  resolvida: "Resolvida",
};
export const channelLabels = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  telefone: "Telefone",
  presencial: "Presencial",
  rh_net: "RH Net",
};
export const typeLabels: Record<string, string> = {
  ferias: "Férias",
  atestado: "Atestado",
  dados_bancarios: "Dados bancários",
  duvida_holerite: "Dúvida sobre holerite",
  duvida_beneficio: "Dúvida sobre benefício",
  duvida_ponto: "Dúvida sobre ponto",
  admissao: "Admissão",
  rescisao: "Rescisão",
  horas_extras: "Horas extras",
  ponto: "Ponto",
  afastamento: "Afastamento",
  dependente: "Dependente",
  cadastro: "Cadastro",
  alteracao_salarial: "Alteração salarial",
  documento_empresa: "Documento da empresa",
};
export const stageLabels: Record<string, string> = {
  coleta_rh: "Coleta RH",
  envio_contabilidade: "Envio à contabilidade",
  processamento: "Processamento",
  conferencia_rh: "Conferência RH",
  fechamento: "Fechamento",
  holerites_liberados: "Holerites liberados",
};
export const employeeLabels: Record<string, string> = {
  ativo: "Ativo",
  afastado: "Afastado",
  ferias: "Em férias",
  aviso_previo: "Aviso prévio",
  em_admissao: "Em admissão",
};
export const date = (value: string | null | undefined) =>
  value ? value.slice(0, 10).split("-").reverse().join("/") : "—";
export const shortDate = (value: string) => date(value).slice(0, 5);
export const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((x) => x[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join("");
export const daysTo = (value: string | null) =>
  value
    ? Math.round(
        (Date.parse(value + "T12:00:00Z") -
          Date.parse(REFERENCE_DATE + "T12:00:00Z")) /
          86400000,
      )
    : Infinity;
export const active = (p: Pending) => p.status !== "resolvida";
export const blocker = (p: Pending) => active(p) && p.bloqueia_fechamento;
export const deadline = (p: Pending) => {
  if (!p.prazo) return "Sem prazo";
  if (!active(p)) return date(p.prazo);
  const n = daysTo(p.prazo);
  return n < 0
    ? "Atrasada"
    : n === 0
      ? "Vence hoje"
      : n === 1
        ? "Vence amanhã"
        : n <= 3
          ? `Vence em ${n} dias`
          : date(p.prazo);
};
export const lastActivity = (p: Pending) =>
  p.historico.at(-1)?.data ?? p.criada_em;
export const priority = (p: Pending) =>
  active(p)
    ? (p.id === "P019" ? 1000 : 0) +
      (blocker(p) ? 100 : 0) +
      (daysTo(p.prazo) <= 2 ? 30 : 0) +
      (p.responsavel === "contabilidade" ? 10 : 0)
    : -1000;
export const isCritical = (p: Pending) =>
  active(p) &&
  (p.id === "P019" ||
    daysTo(p.prazo) <= 0 ||
    (blocker(p) && daysTo(p.prazo) <= 1));
export function owner(p: Pending, data: Dataset) {
  return p.responsavel === "contabilidade"
    ? data.escritorio.responsavel_dp.nome
    : p.responsavel === "rh"
      ? data.empresas.find((c) => c.id === p.empresa_id)!.rh_nome
      : (data.funcionarios.find((e) => e.id === p.funcionario_id)?.nome ??
        "Funcionário da empresa");
}
export function closingFor(
  company: Company,
  data: Dataset,
  period = CURRENT_PERIOD,
): Closing {
  const c = structuredClone(
    data.fechamentos.find(
      (f) => f.empresa_id === company.id && f.competencia === period,
    )!,
  );
  if (c.status === "bloqueado" && c.bloqueio) {
    const ids = c.bloqueio.match(/P\d{3}/g) ?? [];
    if (
      ids.length &&
      ids.every((id) => !data.pendencias.some((p) => p.id === id && active(p)))
    ) {
      c.status = "em_andamento";
      delete c.bloqueio;
    }
  }
  return c;
}
export const progress = (c: Closing) =>
  Math.round(
    (c.etapas.filter((s) => s.status === "concluida").length /
      c.etapas.length) *
      100,
  );
export function alertsFor(p: Pending) {
  if (!active(p)) return [];
  const labels = [];
  if (isCritical(p)) labels.push("Prioridade crítica");
  if (blocker(p)) labels.push("Bloqueia fechamento");
  if (daysTo(p.prazo) <= 3) labels.push("Prazo próximo");
  if (p.responsavel === "funcionario") labels.push("Aguardando funcionário");
  if (daysTo(lastActivity(p)) <= -5)
    labels.push("Sem atividade há vários dias");
  if (
    ["documento_empresa", "admissao", "atestado", "afastamento"].includes(
      p.tipo,
    )
  )
    labels.push("Documento pendente");
  return labels;
}
export function scoped(data: Dataset, role: Role, companyId: string) {
  return data.pendencias.filter((p) =>
    role === "funcionario"
      ? p.funcionario_id === "F01"
      : role === "rh"
        ? p.empresa_id === companyId
        : true,
  );
}
export function changeStatus(p: Pending, status: PendingStatus): Pending {
  const next = {
    ...p,
    status,
    resolvida_em: status === "resolvida" ? REFERENCE_DATE : null,
  };
  if (status.startsWith("aguardando_"))
    next.responsavel = status.slice(11) as Role;
  return next;
}
