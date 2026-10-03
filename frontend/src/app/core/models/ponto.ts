// Linha do ponto da equipe (GET /api/ponto?competencia=). Combinar o DTO final com o back.

/**
 * - OK: entrada e saída registradas.
 * - EM_ANDAMENTO: hoje, com entrada e ainda sem saída.
 * - MARCACAO_FALTANDO: dia passado com entrada ou saída faltando.
 * - SEM_MARCACAO: dia útil sem nenhuma marcação.
 */
export type SituacaoPonto = 'OK' | 'EM_ANDAMENTO' | 'MARCACAO_FALTANDO' | 'SEM_MARCACAO';

export interface RegistroPonto {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  /** Setor do funcionário na empresa (Produção, Logística...), não o papel de acesso. */
  departamento: string;
  /** Data ISO (yyyy-MM-dd). */
  data: string;
  /** "HH:mm" */
  entrada: string | null;
  saida: string | null;
  /** Já descontada 1 h de almoço. */
  totalMinutos: number | null;
  extrasMinutos: number;
  situacao: SituacaoPonto;
  ajustado: boolean;
}
