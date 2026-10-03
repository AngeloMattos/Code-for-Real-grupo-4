import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { DASHBOARD_API } from '../../../../core/api/dashboard.api';
import { AuthService } from '../../../../core/auth/auth.service';
import { CompetenciaService, nomeCompetencia } from '../../../../core/competencia';
import { Pendencia } from '../../../../core/models/pendencia';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Icone } from '../../../../shared/components/icone/icone';
import { PendenciaDrawer } from '../../../../shared/components/pendencia-drawer/pendencia-drawer';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PendenciasTable } from '../../../../shared/components/pendencias-table/pendencias-table';

/** Dashboard pessoal: cards grandes de ação e as solicitações em andamento (docs/Desgin.md §5). */
@Component({
  selector: 'app-dashboard-funcionario',
  imports: [CurrencyPipe, RouterLink, EmptyState, Icone, PageHeader, PendenciaDrawer, PendenciasTable],
  templateUrl: './dashboard-funcionario.html',
  styleUrl: './dashboard-funcionario.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFuncionario {
  private readonly api = inject(DASHBOARD_API);
  private readonly competencia = inject(CompetenciaService);
  private readonly usuario = inject(AuthService).usuario;

  protected readonly dashboard = rxResource({
    params: () => this.competencia.atual(),
    stream: ({ params }) => this.api.funcionario(params),
  });

  protected readonly saudacao = computed(() => `Olá, ${this.usuario()?.nome.split(' ')[0] ?? ''}`);
  protected readonly nomeCompetencia = nomeCompetencia;

  /** Pedidos de correção que voltaram para a própria pessoa resolver. */
  protected readonly correcoes = computed(
    () =>
      this.dashboard
        .value()
        ?.solicitacoes.filter(
          (p) => p.status === 'CORRECAO_SOLICITADA' && p.setorResponsavel === 'FUNCIONARIO',
        ).length ?? 0,
  );

  /** Solicitação aberta no drawer de detalhe (null = fechado). */
  protected readonly selecionada = signal<Pendencia | null>(null);

  protected abrir(pendencia: Pendencia): void {
    this.selecionada.set(pendencia);
  }
}
