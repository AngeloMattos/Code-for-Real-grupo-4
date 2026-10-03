import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { PONTO_API } from '../../../../core/api/ponto.api';
import { CompetenciaService } from '../../../../core/competencia';
import { RegistroPonto, SituacaoPonto } from '../../../../core/models/ponto';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Icone } from '../../../../shared/components/icone/icone';
import { PageHeader } from '../../../../shared/components/page-header/page-header';

const PRECISA_AJUSTE: SituacaoPonto[] = ['MARCACAO_FALTANDO', 'SEM_MARCACAO'];

/** Ponto do funcionário: relógio para registrar entrada/saída e o histórico do mês. */
@Component({
  selector: 'app-meu-ponto',
  imports: [DatePipe, EmptyState, Icone, PageHeader],
  templateUrl: './meu-ponto.html',
  styleUrl: './meu-ponto.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeuPonto {
  private readonly api = inject(PONTO_API);
  private readonly router = inject(Router);
  protected readonly competencia = inject(CompetenciaService);

  // ---------- Relógio e marcação de hoje ----------

  protected readonly agora = signal(new Date());

  constructor() {
    const relogio = setInterval(() => this.agora.set(new Date()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));
  }

  protected readonly hoje = rxResource({ stream: () => this.api.hoje() });

  protected readonly registrando = signal(false);
  protected readonly erroRegistro = signal<string | null>(null);

  /** Próxima marcação de hoje; null quando entrada e saída já foram feitas. */
  protected readonly proxima = computed<'entrada' | 'saida' | null>(() => {
    const r = this.hoje.value();
    if (!r?.entrada) return 'entrada';
    return r.saida ? null : 'saida';
  });

  protected registrar(): void {
    this.registrando.set(true);
    this.erroRegistro.set(null);
    this.api.registrar().subscribe({
      next: (registro) => {
        this.hoje.set(registro);
        this.registros.reload();
        this.registrando.set(false);
      },
      error: (e: Error) => {
        this.erroRegistro.set(e.message || 'Não foi possível registrar. Tente de novo.');
        this.registrando.set(false);
      },
    });
  }

  // ---------- Histórico do mês ----------

  protected readonly registros = rxResource({
    params: () => this.competencia.atual(),
    stream: ({ params }) => this.api.meu(params),
  });

  /** Dia mais recente primeiro. */
  protected readonly linhas = computed(() =>
    [...(this.registros.value() ?? [])].sort((a, b) => b.data.localeCompare(a.data)),
  );

  protected readonly resumo = computed(() => {
    const linhas = this.linhas();
    return {
      dias: linhas.filter((r) => r.entrada).length,
      faltando: linhas.filter((r) => PRECISA_AJUSTE.includes(r.situacao)).length,
      minutosTrabalhados: linhas.reduce((soma, r) => soma + (r.totalMinutos ?? 0), 0),
      minutosExtras: linhas.reduce((soma, r) => soma + r.extrasMinutos, 0),
    };
  });

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

  /** Marcação faltando: o funcionário pede o ajuste ao RH pela tela de envio. */
  protected pedirAjuste(r: RegistroPonto): void {
    const [, mes, dia] = r.data.split('-');
    this.router.navigate(['/solicitacoes/nova'], {
      queryParams: { titulo: `Ajuste de ponto ${dia}/${mes}` },
    });
  }
}
