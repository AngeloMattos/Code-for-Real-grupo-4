import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { acoesDaPendencia, ORIENTACAO_TIPO } from '../../../core/acoes-pendencia';
import { PENDENCIA_API } from '../../../core/api/pendencia.api';
import { NOME_STATUS, NOME_TIPO, Pendencia, PendenciaEvento } from '../../../core/models/pendencia';
import { TempoRelativoPipe } from '../../pipes/tempo-relativo.pipe';
import { Papel } from '../../../core/models/usuario';
import { Avatar } from '../avatar/avatar';
import { Icone } from '../icone/icone';
import { PrazoLabel } from '../prazo-label/prazo-label';
import { SetorBadge } from '../setor-badge/setor-badge';
import { StatusBadge } from '../status-badge/status-badge';

/**
 * Drawer de 480 px à direita com o detalhe da pendência e o que o setor logado pode fazer
 * (docs/Desgin.md §5). Usa <dialog> nativo: foco preso, Esc e fundo escuro de graça.
 */
@Component({
  selector: 'app-pendencia-drawer',
  imports: [DatePipe, TempoRelativoPipe, Avatar, Icone, PrazoLabel, SetorBadge, StatusBadge],
  templateUrl: './pendencia-drawer.html',
  styleUrl: './pendencia-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendenciaDrawer {
  /** null fecha o drawer. */
  readonly pendencia = input<Pendencia | null>(null);
  readonly papel = input.required<Papel>();
  readonly fechar = output<void>();

  private readonly api = inject(PENDENCIA_API);
  private readonly dialogo =viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly nomeTipo = NOME_TIPO;
  protected readonly orientacao = computed(() => {
    const p = this.pendencia();
    return p ? ORIENTACAO_TIPO[p.tipo] : '';
  });
  protected readonly nomeStatus = NOME_STATUS;
  protected readonly ehFuncionario = computed(() => this.papel() === 'FUNCIONARIO');

  /** Histórico da pendência aberta; recarrega quando troca a pendência. */
  protected readonly eventos = rxResource({
    params: () => this.pendencia()?.id,
    stream: ({ params }) => this.api.eventos(params),
  });

  /** Balão à direita para quem está vendo (mesmo setor do autor). */
  protected ehMeu(e: PendenciaEvento): boolean {
    return e.autorSetor === this.papel();
  }

  protected readonly situacao = computed(() => {
    const p = this.pendencia();
    return p ? acoesDaPendencia(p, this.papel()) : { acoes: [], aviso: null };
  });

  constructor() {
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.pendencia()) {
        if (!dialogo.open) dialogo.showModal();
      } else if (dialogo.open) {
        dialogo.close();
      }
    });
  }

  /** Clique no fundo escuro (fora do painel) fecha. */
  protected cliqueNoFundo(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) this.dialogo().nativeElement.close();
  }
}
