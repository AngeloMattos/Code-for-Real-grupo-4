import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Título, uma linha explicando a página e a ação principal à direita (conteúdo projetado). */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    h1 { margin: 0; font-size: var(--texto-pagina); font-weight: 600; line-height: 1.3; }
    p { margin: 4px 0 0; color: var(--cor-texto-secundario); }
    .acoes { display: flex; flex-wrap: wrap; gap: 8px; }
  `,
  template: `
    <div>
      <h1>{{ titulo() }}</h1>
      @if (descricao()) {
        <p>{{ descricao() }}</p>
      }
    </div>
    <div class="acoes"><ng-content /></div>
  `,
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly descricao = input<string>();
}
