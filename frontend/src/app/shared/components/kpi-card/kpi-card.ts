import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

import { Icone, NomeIcone } from '../icone/icone';

export type TomKpi = 'neutro' | 'alerta' | 'perigo';

/** Número grande, rótulo e detalhe; clicável, abre a Central já filtrada. */
@Component({
  selector: 'app-kpi-card',
  imports: [RouterLink, Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; }
    a {
      display: grid;
      gap: 4px;
      height: 100%;
      padding: 16px;
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-card);
      background: var(--cor-superficie);
      color: inherit;
      text-decoration: none;
      transition: border-color 0.15s;
    }
    a:hover { border-color: var(--cor-marca); }
    .topo { display: flex; align-items: center; justify-content: space-between; color: var(--cor-texto-secundario); font-weight: 500; }
    .icone { display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--raio-controle); background: var(--cor-fundo); }
    .valor { font-size: var(--texto-kpi); font-weight: 600; line-height: 1.2; font-variant-numeric: tabular-nums; }
    .detalhe { font-size: var(--texto-legenda); color: var(--cor-texto-secundario); }
    :host(.alerta) .icone { color: var(--status-analise-texto); background: var(--status-analise-fundo); }
    :host(.perigo) .icone { color: var(--status-atrasada-texto); background: var(--status-atrasada-fundo); }
    :host(.perigo) .valor { color: var(--status-atrasada-texto); }
  `,
  host: { '[class]': 'tom()' },
  template: `
    <a [routerLink]="link()" [queryParams]="filtro()">
      <span class="topo">
        {{ rotulo() }}
        <span class="icone"><app-icone [nome]="icone()" /></span>
      </span>
      <span class="valor">{{ valor() }}</span>
      @if (detalhe()) {
        <span class="detalhe">{{ detalhe() }}</span>
      }
    </a>
  `,
})
export class KpiCard {
  readonly rotulo = input.required<string>();
  readonly valor = input.required<number>();
  readonly icone = input<NomeIcone>('pendencias');
  readonly detalhe = input<string>();
  readonly tom = input<TomKpi>('neutro');
  readonly link = input('/pendencias');
  readonly filtro = input<Params>({});
}
