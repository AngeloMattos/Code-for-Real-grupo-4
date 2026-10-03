import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { NOME_STATUS, StatusPendencia } from '../../../core/models/pendencia';

const CLASSE: Record<StatusPendencia, string> = {
  ABERTA: 'aberta',
  EM_ANALISE: 'analise',
  CORRECAO_SOLICITADA: 'correcao',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada',
};

/** Status sempre com o nome escrito, nunca só pela cor. */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classe()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      height: 22px;
      padding: 0 8px;
      border-radius: 999px;
      font-size: var(--texto-legenda);
      font-weight: 500;
      white-space: nowrap;
    }
    :host(.aberta) { color: var(--status-aberta-texto); background: var(--status-aberta-fundo); }
    :host(.analise) { color: var(--status-analise-texto); background: var(--status-analise-fundo); }
    :host(.correcao) { color: var(--status-correcao-texto); background: var(--status-correcao-fundo); }
    :host(.concluida) { color: var(--status-concluida-texto); background: var(--status-concluida-fundo); }
    :host(.cancelada) { color: var(--cor-texto-secundario); background: var(--cor-fundo); }
  `,
  template: '{{ nome() }}',
})
export class StatusBadge {
  readonly status = input.required<StatusPendencia>();

  protected readonly nome = computed(() => NOME_STATUS[this.status()]);
  protected readonly classe = computed(() => CLASSE[this.status()]);
}
