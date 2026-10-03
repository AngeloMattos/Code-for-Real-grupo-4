// Espelha PendenciaResponse e os enums do Spring (docs/BACKEND.md §5 e §6).
import { Papel } from './usuario';

export type StatusPendencia =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'CORRECAO_SOLICITADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type TipoPendencia =
  | 'ATESTADO'
  | 'FERIAS'
  | 'ALTERACAO_CADASTRAL'
  | 'DUVIDA'
  | 'AJUSTE_PONTO'
  | 'DOCUMENTO_SOLICITADO'
  | 'CORRECAO_FOLHA';

export interface Pendencia {
  id: number;
  titulo: string;
  /** Texto livre de quem criou (o que falta, o que foi enviado). */
  descricao: string | null;
  tipo: TipoPendencia;
  status: StatusPendencia;
  setorResponsavel: Papel;
  responsavelNome: string | null;
  funcionarioId: number;
  funcionarioNome: string;
  /** Data ISO (yyyy-MM-dd). */
  prazo: string | null;
  atrasada: boolean;
  criadoEm: string;
  ultimaAtualizacao: string;
}

export const NOME_STATUS: Record<StatusPendencia, string> = {
  ABERTA: 'Aberta',
  EM_ANALISE: 'Em análise',
  CORRECAO_SOLICITADA: 'Correção solicitada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export const NOME_TIPO: Record<TipoPendencia, string> = {
  ATESTADO: 'Atestado',
  FERIAS: 'Férias',
  ALTERACAO_CADASTRAL: 'Alteração cadastral',
  DUVIDA: 'Dúvida',
  AJUSTE_PONTO: 'Ajuste de ponto',
  DOCUMENTO_SOLICITADO: 'Documento solicitado',
  CORRECAO_FOLHA: 'Correção da folha',
};

/** POST /pendencias (CriarPendenciaRequest, docs/BACKEND.md §6). */
export interface CriarPendenciaRequest {
  funcionarioId: number;
  titulo: string;
  descricao: string | null;
  tipo: TipoPendencia;
  setorResponsavel: Papel;
  /** Data ISO (yyyy-MM-dd); hoje ou depois. */
  prazo: string | null;
  bloqueiaFolha: boolean;
}

export type TipoEvento ='CRIACAO' | 'COMENTARIO' | 'MUDANCA_STATUS';

/** Item do histórico (GET /pendencias/{id}/eventos), em ordem cronológica. */
export interface PendenciaEvento {
  id: number;
  tipo: TipoEvento;
  autorNome: string;
  autorSetor: Papel;
  comentario: string | null;
  statusAnterior: StatusPendencia | null;
  statusNovo: StatusPendencia | null;
  quando: string;
}
