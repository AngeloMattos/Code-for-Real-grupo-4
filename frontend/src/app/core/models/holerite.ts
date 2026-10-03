// Holerite do funcionário logado (GET /holerites). Só aparecem os já publicados pelo Financeiro.
import { LinhaMemoria } from './folha';

export interface Holerite {
  /** "2026-08" */
  competencia: string;
  /** Data ISO de publicação. */
  publicadoEm: string;
  funcionarioNome: string;
  cargo: string;
  departamento: string;
  empresaNome: string;
  /** Proventos e descontos, com a origem de cada valor. */
  linhas: LinhaMemoria[];
  totalProventos: number;
  totalDescontos: number;
  liquido: number;
}
