import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icone, NomeIcone } from '../icone/icone';

/** Estado vazio: ícone, frase e uma ação (conteúdo projetado). */
@Component({
  selector: 'app-empty-state',
  imports: [Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: 8px;
      padding: 32px 16px;
      text-align: center;
    }
    .icone {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      margin-bottom: 4px;
      border-radius: 50%;
      background: var(--cor-marca-suave);
      color: var(--cor-marca);
    }
    strong { font-size: var(--texto-form); font-weight: 600; }
    p { max-width: 360px; margin: 0; color: var(--cor-texto-secundario); }
    .acao:not(:empty) { margin-top: 8px; }
  `,
  template: `
    <span class="icone"><app-icone [nome]="icone()" [tamanho]="22" /></span>
    <strong>{{ titulo() }}</strong>
    @if (texto()) {
      <p>{{ texto() }}</p>
    }
    <div class="acao"><ng-content /></div>
  `,
})
export class EmptyState {
  readonly icone = input<NomeIcone>('caixa');
  readonly titulo = input.required<string>();
  readonly texto = input<string>();
}
