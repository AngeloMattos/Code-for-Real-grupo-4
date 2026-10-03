import { computed, Injectable, signal } from '@angular/core';

const NOME_MES = new Intl.DateTimeFormat('pt-BR', { month: 'long' });

/** "2026-10" → "Outubro/2026". */
export function nomeCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number);
  const nome = NOME_MES.format(new Date(ano, mes - 1, 1));
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}/${ano}`;
}

function competenciaDe(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

/** Competência escolhida no seletor da barra superior; vale para o app inteiro. */
@Injectable({ providedIn: 'root' })
export class CompetenciaService {
  /** Mês atual e os 5 anteriores. */
  readonly opcoes: string[] = Array.from({ length: 6 }, (_, i) => {
    const hoje = new Date();
    return competenciaDe(new Date(hoje.getFullYear(), hoje.getMonth() - i, 1));
  });

  readonly atual = signal(this.opcoes[0]);
  readonly nome = computed(() => nomeCompetencia(this.atual()));
}
