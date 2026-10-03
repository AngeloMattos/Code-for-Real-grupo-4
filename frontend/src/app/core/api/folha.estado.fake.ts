// Status das folhas na demo, compartilhado entre o fake da folha e o do dashboard.
// Fica em memória: recarregar a página volta ao começo (bom para ensaiar).
import { ETAPA_DO_STATUS, StatusFolha } from '../models/folha';
import { Pendencia } from '../models/pendencia';

export { ETAPA_DO_STATUS };

export interface EstadoFolhaDemo {
  status: StatusFolha;
  calculadaEm: string | null;
  fechadaEm: string | null;
  fechadaPorNome: string | null;
  holeritesPublicados: boolean;
}

const estados = new Map<string, EstadoFolhaDemo>();

function competenciaAtual(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
}

/** Quantos meses a competência está antes da atual (0 = mês corrente). */
function mesesAtras(competencia: string): number {
  const [ano, mes] = competencia.split('-').map(Number);
  const [anoAtual, mesAtual] = competenciaAtual().split('-').map(Number);
  return (anoAtual - ano) * 12 + (mesAtual - mes);
}

/**
 * Mês corrente: aberta e bloqueada. Mês anterior: em conferência com a Contabilidade.
 * Mais antigos: fechados e com holerites publicados. Assim a demo passa por todas as etapas.
 */
export function estadoFolhaDemo(competencia: string): EstadoFolhaDemo {
  let estado = estados.get(competencia);
  if (!estado) {
    const atras = mesesAtras(competencia);
    const [ano, mes] = competencia.split('-').map(Number);
    const noFimDoMes = (dia: number, hora: number) => new Date(ano, mes, dia, hora).toISOString();

    estado =
      atras <= 0
        ? { status: 'ABERTA', calculadaEm: null, fechadaEm: null, fechadaPorNome: null, holeritesPublicados: false }
        : atras === 1
          ? { status: 'EM_CONFERENCIA', calculadaEm: noFimDoMes(1, 10), fechadaEm: null, fechadaPorNome: null, holeritesPublicados: false }
          : { status: 'FECHADA', calculadaEm: noFimDoMes(1, 10), fechadaEm: noFimDoMes(4, 16), fechadaPorNome: 'Beatriz Rocha', holeritesPublicados: true };
    estados.set(competencia, estado);
  }
  return estado;
}

export function statusFolhaDemo(competencia: string): StatusFolha {
  return estadoFolhaDemo(competencia).status;
}

export function atualizarFolhaDemo(competencia: string, mudancas: Partial<EstadoFolhaDemo>): EstadoFolhaDemo {
  const novo = { ...estadoFolhaDemo(competencia), ...mudancas };
  estados.set(competencia, novo);
  return novo;
}

/** As pendências da demo são do mês corrente; meses passados não têm bloqueio. */
export function bloqueiosDaCompetencia<T extends Pendencia & { bloqueiaFolha: boolean }>(
  competencia: string,
  pendencias: T[],
): T[] {
  if (mesesAtras(competencia) !== 0) return [];
  return pendencias.filter(
    (p) => p.bloqueiaFolha && p.status !== 'CONCLUIDA' && p.status !== 'CANCELADA',
  );
}
