import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';

import { FOLHA_API } from '../../core/api/folha.api';
import { AuthService } from '../../core/auth/auth.service';
import { CompetenciaService } from '../../core/competencia';
import { ETAPA_DO_STATUS, Folha, ItemFolha, NOME_STATUS_FOLHA } from '../../core/models/folha';
import { Pendencia } from '../../core/models/pendencia';
import { Avatar } from '../../shared/components/avatar/avatar';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FolhaStepper } from '../../shared/components/folha-stepper/folha-stepper';
import { Icone } from '../../shared/components/icone/icone';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { PendenciaDrawer } from '../../shared/components/pendencia-drawer/pendencia-drawer';
import { SetorBadge } from '../../shared/components/setor-badge/setor-badge';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { MemoriaDrawer } from './components/memoria-drawer/memoria-drawer';

type AcaoFolha = 'calcular' | 'enviar' | 'fechar' | 'publicar';

const SUCESSO: Record<AcaoFolha, string> = {
  calcular: 'Prévia calculada a partir do ponto e das pendências do mês.',
  enviar: 'Folha enviada para a contabilidade conferir.',
  fechar: 'Folha fechada. O Financeiro já pode publicar os holerites.',
  publicar: 'Holerites publicados: os funcionários já podem ver.',
};

/**
 * /folha: prévia e fechamento (docs/Desgin.md §5).
 * RH e Admin veem só o status; valores por funcionário só para Financeiro e Contabilidade (LGPD).
 */
@Component({
  selector: 'app-folha',
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    Avatar,
    EmptyState,
    FolhaStepper,
    Icone,
    MemoriaDrawer,
    PageHeader,
    PendenciaDrawer,
    SetorBadge,
    StatusBadge,
  ],
  templateUrl: './folha.html',
  styleUrl: './folha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolhaPagamento {
  private readonly api = inject(FOLHA_API);
  protected readonly competencia = inject(CompetenciaService);
  protected readonly papel = inject(AuthService).papel;

  protected readonly nomeStatus = NOME_STATUS_FOLHA;
  protected readonly etapaDoStatus = ETAPA_DO_STATUS;

  protected readonly ehFinanceiro = computed(() => this.papel() === 'FINANCEIRO');
  protected readonly ehContabilidade = computed(() => this.papel() === 'CONTABILIDADE');
  protected readonly podeVerValores = computed(() => this.ehFinanceiro() || this.ehContabilidade());

  protected readonly folha = rxResource({
    params: () => this.competencia.atual(),
    stream: ({ params }) => this.api.folha(params),
  });

  /** Recarrega quando a folha muda de status ou é recalculada; não carrega para quem não pode ver. */
  protected readonly itens = rxResource({
    params: () => {
      const f = this.folha.value();
      return this.podeVerValores() && f
        ? { competencia: f.competencia, status: f.status, calculadaEm: f.calculadaEm }
        : undefined;
    },
    stream: ({ params }) => this.api.itens(params.competencia),
  });

  protected readonly totais = computed(() => {
    const itens = this.itens.value() ?? [];
    const somar = (valor: (i: ItemFolha) => number) =>
      Math.round(itens.reduce((total, i) => total + valor(i), 0) * 100) / 100;
    return {
      salarioBase: somar((i) => i.salarioBase),
      horasExtras: somar((i) => i.valorHorasExtras),
      faltas: somar((i) => i.valorFaltas),
      descontos: somar((i) => descontos(i)),
      liquido: somar((i) => i.liquido),
      proventos: somar((i) => i.salarioBase + i.valorHorasExtras),
      todosDescontos: somar((i) => i.valorFaltas + descontos(i)),
      bloqueados: itens.filter((i) => i.bloqueio).length,
    };
  });

  // ---------- Ações ----------

  protected readonly executando = signal<AcaoFolha | null>(null);
  /** Some ao trocar de competência. */
  protected readonly mensagem = linkedSignal<string, { tipo: 'sucesso' | 'erro'; texto: string } | null>({
    source: this.competencia.atual,
    computation: () => null,
  });

  private readonly confirmacao = viewChild<ElementRef<HTMLDialogElement>>('confirmacao');

  protected executar(acao: AcaoFolha): void {
    const folha = this.folha.value();
    if (!folha || this.executando()) return;

    const chamadas: Record<AcaoFolha, (c: string) => Observable<Folha>> = {
      calcular: (c) => this.api.calcular(c),
      enviar: (c) => this.api.enviarParaContabilidade(c),
      fechar: (c) => this.api.fechar(c),
      publicar: (c) => this.api.publicarHolerites(c),
    };

    this.mensagem.set(null);
    this.executando.set(acao);
    chamadas[acao](folha.competencia)
      .pipe(finalize(() => this.executando.set(null)))
      .subscribe({
        next: (nova) => {
          this.folha.value.set(nova);
          this.mensagem.set({ tipo: 'sucesso', texto: SUCESSO[acao] });
        },
        error: (e: unknown) => this.mensagem.set({ tipo: 'erro', texto: mensagemDeErro(e) }),
      });
  }

  /** Fechar não tem volta: pede confirmação antes. */
  protected pedirFechamento(): void {
    this.confirmacao()?.nativeElement.showModal();
  }

  protected confirmarFechamento(): void {
    this.confirmacao()?.nativeElement.close();
    this.executar('fechar');
  }

  // ---------- Drawers ----------

  protected readonly itemAberto = signal<ItemFolha | null>(null);
  protected readonly pendenciaAberta = signal<Pendencia | null>(null);

  protected descontos(item: ItemFolha): number {
    return descontos(item);
  }
}

/** INSS + IRRF + VT (as faltas têm coluna própria). */
function descontos(item: ItemFolha): number {
  return Math.round((item.inss + item.irrf + item.valeTransporte) * 100) / 100;
}

function mensagemDeErro(e: unknown): string {
  if (e instanceof HttpErrorResponse && typeof e.error?.mensagem === 'string') {
    return e.error.mensagem;
  }
  return 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.';
}
