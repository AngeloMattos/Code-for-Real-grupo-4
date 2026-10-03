import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Papel } from '../../../core/models/usuario';

/** Iniciais sobre a cor do setor. Decorativo: o nome sempre aparece ao lado. */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.--setor]': "'var(--setor-' + setor().toLowerCase() + ')'",
    '[style.--tamanho.px]': 'tamanho()',
  },
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex-shrink: 0;
      width: var(--tamanho);
      height: var(--tamanho);
      border-radius: 50%;
      background: var(--setor);
      color: #fff;
      font-size: calc(var(--tamanho) * 0.4);
      font-weight: 600;
      line-height: 1;
    }
  `,
  template: '{{ iniciais() }}',
})
export class Avatar {
  readonly nome = input.required<string>();
  readonly setor = input<Papel>('FUNCIONARIO');
  readonly tamanho = input(28);

  protected readonly iniciais = computed(() => {
    const partes = this.nome().trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  });
}
