import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { DASHBOARD_API } from '../../../../core/api/dashboard.api';
import { CompetenciaService } from '../../../../core/competencia';
import { Pendencia } from '../../../../core/models/pendencia';
import { NOME_SETOR, Papel } from '../../../../core/models/usuario';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { FolhaStepper } from '../../../../shared/components/folha-stepper/folha-stepper';
import { Icone } from '../../../../shared/components/icone/icone';
import { KpiCard } from '../../../../shared/components/kpi-card/kpi-card';
import { PendenciaDrawer } from '../../../../shared/components/pendencia-drawer/pendencia-drawer';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PendenciasTable } from '../../../../shared/components/pendencias-table/pendencias-table';
import { Timeline } from '../../../../shared/components/timeline/timeline';

const DESCRICAO: Record<Exclude<Papel, 'FUNCIONARIO'>, string> = {
  RH: 'Pessoas, documentos e prazos de',
  FINANCEIRO: 'O que falta para calcular e fechar a folha de',
  CONTABILIDADE: 'Conferência e fechamento da folha de',
  ADMIN: 'Visão geral da empresa em',
};

/** Dashboard de RH, Financeiro, Contabilidade e Admin (docs/Desgin.md §5). */
@Component({
  selector: 'app-dashboard-setor',
  imports: [
    DatePipe,
    RouterLink,
    EmptyState,
    FolhaStepper,
    Icone,
    KpiCard,
    PageHeader,
    PendenciaDrawer,
    PendenciasTable,
    Timeline,
  ],
  templateUrl: './dashboard-setor.html',
  styleUrl: './dashboard-setor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSetor {
  private readonly api = inject(DASHBOARD_API);
  protected readonly competencia = inject(CompetenciaService);

  readonly papel = input.required<Exclude<Papel, 'FUNCIONARIO'>>();

  protected readonly dashboard = rxResource({
    params: () => ({ papel: this.papel(), competencia: this.competencia.atual() }),
    stream: ({ params }) => this.api.setor(params.papel, params.competencia),
  });

  protected readonly descricao = computed(
    () => `${DESCRICAO[this.papel()]} ${this.competencia.nome()}.`,
  );
  protected readonly nomeSetor = computed(() => NOME_SETOR[this.papel()]);
  /** O Admin vê a Central só para leitura. */
  protected readonly podeCriar = computed(() => this.papel() !== 'ADMIN');

  /** Pendência aberta no drawer de detalhe (null = fechado). */
  protected readonly selecionada = signal<Pendencia | null>(null);

  protected abrir(pendencia: Pendencia): void {
    this.selecionada.set(pendencia);
  }
}
