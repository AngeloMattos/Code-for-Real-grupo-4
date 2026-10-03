// Resposta de GET /api/dashboard, conforme o papel (docs/BACKEND.md §8).
import { Pendencia } from './pendencia';
import { Papel } from './usuario';

export interface Kpis {
  abertas: number;
  vencemEm3Dias: number;
  atrasadas: number;
  aguardandoValidacao: number;
}

export type EtapaFolha = 'PONTO' | 'DOCUMENTOS' | 'PREVIA' | 'CONFERENCIA' | 'FECHADA';

export interface FechamentoFolha {
  /** "2026-10" */
  competencia: string;
  etapaAtual: EtapaFolha;
  /** Pendências que bloqueiam a folha (calculado no back, não é status). */
  bloqueios: number;
  /** Data ISO (yyyy-MM-dd). */
  prazoFechamento: string;
}

export interface Atividade {
  id: number;
  autorNome: string;
  autorSetor: Papel;
  descricao: string;
  quando: string;
}

export interface DashboardSetor {
  kpis: Kpis;
  precisaDaSuaAcao: Pendencia[];
  fechamento: FechamentoFolha;
  atividades: Atividade[];
}

export interface DashboardFuncionario {
  solicitacoes: Pendencia[];
  /** Concluídas recentemente, para consultar a resposta. */
  respondidas: Pendencia[];
  pontoHoje: { entrada: string | null; saida: string | null };
  ultimoHolerite: { competencia: string; liquido: number } | null;
}
