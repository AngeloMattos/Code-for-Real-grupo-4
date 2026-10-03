import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { NOME_SETOR, Papel } from '../../../core/models/usuario';

/** "Com quem está": ponto na cor do setor e o nome escrito em texto escuro (contraste). */
@Component({
  selector: 'app-setor-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--setor]': "'var(--setor-' + setor().toLowerCase() + ')'" },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 22px;
      padding: 0 8px;
      border: 1px solid var(--cor-borda);
      border-radius: 999px;
      background: var(--cor-superficie);
      font-size: var(--texto-legenda);
      font-weight: 500;
      white-space: nowrap;
    }
    :host::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--setor);
    }
  `,
  template: '{{ nome() }}',
})
export class SetorBadge {
  readonly setor = input.required<Papel>();

  protected readonly nome = computed(() => NOME_SETOR[this.setor()]);
}
