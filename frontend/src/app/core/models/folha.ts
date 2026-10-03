// Folha e ItemFolha (docs/BACKEND.md §5 e §8). Valores em reais com 2 casas; no back são BigDecimal.
import { EtapaFolha } from './dashboard';
import { Pendencia } from './pendencia';

export type StatusFolha = 'ABERTA' | 'PREVIA_CALCULADA' | 'EM_CONFERENCIA' | 'FECHADA';

export const NOME_STATUS_FOLHA: Record<StatusFolha, string> = {
  ABERTA: 'Aberta',
  PREVIA_CALCULADA: 'Prévia calculada',
  EM_CONFERENCIA: 'Em conferência',
  FECHADA: 'Fechada',
};

export const ETAPA_DO_STATUS: Record<StatusFolha, EtapaFolha> = {
  ABERTA: 'DOCUMENTOS',
  PREVIA_CALCULADA: 'PREVIA',
  EM_CONFERENCIA: 'CONFERENCIA',
  FECHADA: 'FECHADA',
};

/** GET /folhas/{competencia}: status, etapas e bloqueios. */
export interface Folha {
  /** "2026-10" */
  competencia: string;
  status: StatusFolha;
  calculadaEm: string | null;
  fechadaEm: string | null;
  fechadaPorNome: string | null;
  holeritesPublicados: boolean;
  /** Data ISO (yyyy-MM-dd). */
  prazoFechamento: string;
  /** Pendências com bloqueiaFolha ainda abertas: "bloqueada" é calculado, não é status. */
  bloqueios: Pendencia[];
}

/** Uma linha da memória de cálculo: o valor e de onde ele veio. */
export interface LinhaMemoria {
  rotulo: string;
  natureza: 'PROVENTO' | 'DESCONTO';
  valor: number;
  origem: string;
}

/** GET /folhas/{competencia}/itens: uma linha por funcionário (vira o holerite). */
export interface ItemFolha {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  cargo: string;
  departamento: string;
  salarioBase: number;
  horasExtras: number;
  valorHorasExtras: number;
  diasFalta: number;
  valorFaltas: number;
  inss: number;
  irrf: number;
  valeTransporte: number;
  liquido: number;
  /** Ex.: "Atestado em análise". null = OK. */
  bloqueio: string | null;
  memoria: LinhaMemoria[];
}
