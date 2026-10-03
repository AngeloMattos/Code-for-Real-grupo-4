import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { PONTO_API } from '../../../../core/api/ponto.api';
import { CompetenciaService } from '../../../../core/competencia';
import { RegistroPonto, SituacaoPonto } from '../../../../core/models/ponto';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Icone } from '../../../../shared/components/icone/icone';
import { PageHeader } from '../../../../shared/components/page-header/page-header';

const TODOS = '';

const PRECISA_AJUSTE: SituacaoPonto[] = ['MARCACAO_FALTANDO', 'SEM_MARCACAO'];

/** Ponto da equipe para o RH: por funcionário e dia, agrupado por setor (docs/Desgin.md §5). */
@Component({
  selector: 'app-ponto-equipe',
  imports: [DatePipe, Avatar, EmptyState, Icone, PageHeader],
  templateUrl: './ponto-equipe.html',
  styleUrl: './ponto-equipe.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PontoEquipe {
  private readonly api = inject(PONTO_API);
  private readonly router = inject(Router);
  protected readonly competencia = inject(CompetenciaService);

  protected readonly todos = TODOS;

  protected readonly registros = rxResource({
    params: () => this.competencia.atual(),
    stream: ({ params }) => this.api.equipe(params),
  });

  private readonly lista = computed(() => this.registros.value() ?? []);

  // ---------- Filtros ----------

  protected readonly setor = signal(TODOS);
  protected readonly soFaltando = signal(false);

  /** Dias com marcação, do mais recente para o mais antigo. */
  protected readonly dias = computed(() =>
    [...new Set(this.lista().map((r) => r.data))].sort().reverse(),
  );

  /** Começa no dia mais recente e volta para ele quando a competência muda. */
  protected readonly dia = linkedSignal(() => this.dias()[0] ?? TODOS);

  protected readonly setores = computed(() => {
    const contagem = new Map<string, Set<number>>();
    for (const r of this.lista()) {
      if (!contagem.has(r.departamento)) contagem.set(r.departamento, new Set());
      contagem.get(r.departamento)!.add(r.funcionarioId);
    }
    return [...contagem.entries()]
      .map(([nome, ids]) => ({ nome, funcionarios: ids.size }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });

  protected readonly totalFuncionarios = computed(
    () => new Set(this.lista().map((r) => r.funcionarioId)).size,
  );

  /** Setor + dia; a base do resumo. */
  private readonly noPeriodo = computed(() => {
    const setor = this.setor();
    const dia = this.dia();
    return this.lista().filter(
      (r) => (setor === TODOS || r.departamento === setor) && (dia === TODOS || r.data === dia),
    );
  });

  protected readonly visiveis = computed(() =>
    this.soFaltando()
      ? this.noPeriodo().filter((r) => PRECISA_AJUSTE.includes(r.situacao))
      : this.noPeriodo(),
  );

  /** Linhas separadas por setor; dentro de cada um, dia mais recente primeiro e depois por nome. */
  protected readonly grupos = computed(() => {
    const porSetor = new Map<string, RegistroPonto[]>();
    for (const r of this.visiveis()) {
      if (!porSetor.has(r.departamento)) porSetor.set(r.departamento, []);
      porSetor.get(r.departamento)!.push(r);
    }
    return [...porSetor.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([nome, linhas]) => ({
        nome,
        linhas: linhas.sort(
          (a, b) => b.data.localeCompare(a.data) || a.funcionarioNome.localeCompare(b.funcionarioNome),
        ),
        faltando: linhas.filter((r) => PRECISA_AJUSTE.includes(r.situacao)).length,
      }));
  });

  protected readonly resumo = computed(() => {
    const linhas = this.noPeriodo();
    return {
      funcionarios: new Set(linhas.map((r) => r.funcionarioId)).size,
      faltando: linhas.filter((r) => PRECISA_AJUSTE.includes(r.situacao)).length,
      minutosTrabalhados: linhas.reduce((soma, r) => soma + (r.totalMinutos ?? 0), 0),
      minutosExtras: linhas.reduce((soma, r) => soma + r.extrasMinutos, 0),
    };
  });

  protected readonly filtrosAtivos = computed(
    () => this.setor() !== TODOS || this.soFaltando(),
  );

  protected limparFiltros(): void {
    this.setor.set(TODOS);
    this.soFaltando.set(false);
  }

  // ---------- Apresentação ----------

  protected precisaAjuste(r: RegistroPonto): boolean {
    return PRECISA_AJUSTE.includes(r.situacao);
  }

  protected rotuloSituacao(r: RegistroPonto): string {
    switch (r.situacao) {
      case 'OK':
        return 'Completo';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'SEM_MARCACAO':
        return 'Sem marcação';
      case 'MARCACAO_FALTANDO':
        return r.entrada ? 'Saída faltando' : 'Entrada faltando';
    }
  }

  /** 485 → "8h05". */
  protected horas(minutos: number | null): string {
    if (minutos === null) return '—';
    return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
  }

  /** "2026-10-02" → Date local (sem pular um dia por fuso). */
  protected data(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  /** Marcação faltando vira pendência de ajuste de ponto com o RH. */
  protected criarPendencia(r: RegistroPonto): void {
    this.router.navigate(['/pendencias/nova'], {
      queryParams: { tipo: 'AJUSTE_PONTO', funcionarioId: r.funcionarioId, data: r.data },
    });
  }
}
