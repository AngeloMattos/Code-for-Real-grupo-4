import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Icone } from '../icone/icone';

/** Data do prazo e "em 2 dias", ou "atrasada 1 dia" em vermelho. */
@Component({
  selector: 'app-prazo-label',
  imports: [DatePipe, Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.atrasada]': 'atrasada()' },
  styles: `
    :host { display: inline-flex; flex-direction: column; line-height: 1.3; white-space: nowrap; }
    .data { font-variant-numeric: tabular-nums; }
    .relativo { display: inline-flex; align-items: center; gap: 4px; font-size: var(--texto-legenda); color: var(--cor-texto-secundario); }
    :host(.atrasada) .relativo { color: var(--status-atrasada-texto); font-weight: 500; }
  `,
  template: `
    @if (data(); as d) {
      <span class="data">{{ d | date: 'dd/MM' }}</span>
      <span class="relativo">
        @if (atrasada()) {
          <app-icone nome="triangulo" [tamanho]="12" />
        }
        {{ relativo() }}
      </span>
    } @else {
      <span class="relativo">Sem prazo</span>
    }
  `,
})
export class PrazoLabel {
  /** Data ISO (yyyy-MM-dd). */
  readonly prazo = input<string | null>(null);
  /** Vem do back (`atrasada` no DTO); "atrasada" não é status. */
  readonly atrasada = input(false);

  protected readonly data = computed(() => {
    const prazo = this.prazo();
    if (!prazo) return null;
    const [ano, mes, dia] = prazo.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  });

  protected readonly relativo = computed(() => {
    const data = this.data();
    if (!data) return '';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dias = Math.round((data.getTime() - hoje.getTime()) / 86_400_000);

    if (dias < 0) {
      const n = Math.abs(dias);
      return `atrasada ${n} ${n === 1 ? 'dia' : 'dias'}`;
    }
    if (dias === 0) return 'vence hoje';
    if (dias === 1) return 'amanhã';
    return `em ${dias} dias`;
  });
}
