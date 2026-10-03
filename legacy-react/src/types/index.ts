export type Role = "funcionario" | "rh" | "contabilidade";
export type PendingStatus =
  | "aberta"
  | "aguardando_funcionario"
  | "aguardando_rh"
  | "aguardando_contabilidade"
  | "resolvida";
export type Channel =
  "whatsapp" | "email" | "telefone" | "presencial" | "rh_net";
export interface Message {
  data: string;
  autor: string;
  papel: Role;
  canal: Channel;
  mensagem: string;
}
export interface Pending {
  id: string;
  empresa_id: string;
  funcionario_id: string | null;
  tipo: string;
  titulo: string;
  descricao: string;
  aberta_por: Role;
  responsavel: Role;
  status: PendingStatus;
  criada_em: string;
  prazo: string | null;
  resolvida_em: string | null;
  canal_origem: Channel;
  bloqueia_fechamento: boolean;
  relacionada_a?: string[];
  historico: Message[];
  competencia_relacionada?: string;
}
export interface Company {
  id: string;
  nome: string;
  segmento: string;
  qtd_funcionarios: number;
  rh_nome: string;
  rh_cargo: string;
  rh_email: string;
  usa_rh_net: boolean;
  canal_preferido: Channel;
  prazo_envio_rh: string;
  data_pagamento_salario: string;
  observacao?: string;
}
export interface Employee {
  id: string;
  empresa_id: string;
  nome: string;
  cargo: string;
  setor: string;
  data_admissao: string;
  salario_base: number;
  situacao: string;
  usa_app_rh_net: boolean;
  email: string;
  telefone: string;
}
export interface Stage {
  etapa: string;
  descricao: string;
  data_prevista: string;
  data_realizada: string | null;
  status: "concluida" | "em_andamento" | "pendente";
}
export interface Closing {
  empresa_id: string;
  competencia: string;
  status: "concluido" | "em_andamento" | "bloqueado";
  etapas: Stage[];
  bloqueio?: string;
}
export interface Payslip {
  funcionario_id: string;
  competencia: string;
  eventos: {
    codigo: string;
    descricao: string;
    tipo: string;
    referencia: string;
    valor: number;
  }[];
  total_proventos: number;
  total_descontos: number;
  liquido: number;
}
export interface Dataset {
  meta: {
    nome: string;
    aviso: string;
    data_referencia: string;
    competencia_atual: string;
    versao: string;
  };
  dicionario: { tipos_pendencia: string[] };
  escritorio: {
    nome: string;
    cidade: string;
    empresas_atendidas_total: number;
    responsavel_dp: { nome: string; cargo: string; email: string };
  };
  empresas: Company[];
  funcionarios: Employee[];
  pendencias: Pending[];
  fechamentos: Closing[];
  holerites: Payslip[];
}
export type Page =
  | "dashboard"
  | "pendencias"
  | "fechamento"
  | "empresas"
  | "funcionarios"
  | "mensagens"
  | "holerites"
  | "alertas";
