import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';

/** Ocupa as rotas do menu até cada tela ser construída (ordem em docs/Desgin.md §7). */
@Component({
  selector: 'app-em-construcao',
  imports: [RouterLink, EmptyState, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [titulo]="titulo" [descricao]="descricao" />
    <div class="painel">
      <app-empty-state
        icone="ferramenta"
        titulo="Esta tela ainda está em construção"
        texto="O menu e as permissões já estão prontos; o conteúdo entra nas próximas etapas."
      >
        <a class="botao-secundario" routerLink="/inicio">Voltar ao início</a>
      </app-empty-state>
    </div>
  `,
})
export class EmConstrucao {
  private readonly dados = inject(ActivatedRoute).snapshot.data;

  protected readonly titulo = this.dados['titulo'] as string;
  protected readonly descricao = this.dados['descricao'] as string;
}
