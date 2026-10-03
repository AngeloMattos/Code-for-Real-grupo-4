import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

import { ItemFolha } from '../../../../core/models/folha';
import { Icone } from '../../../../shared/components/icone/icone';

/**
 * Drawer com a memória de cálculo de um funcionário: cada valor e de onde ele veio
 * (docs/Desgin.md §5). Mesmo padrão do pendencia-drawer, com <dialog> nativo.
 */
@Component({
  selector: 'app-memoria-drawer',
  imports: [CurrencyPipe, Icone],
  templateUrl: './memoria-drawer.html',
  styleUrl: './memoria-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoriaDrawer {
  /** null fecha o drawer. */
  readonly item = input<ItemFolha | null>(null);
  readonly competenciaNome = input.required<string>();
  /** Folha fechada deixa de ser prévia. */
  readonly previa = input(true);
  readonly fechar = output<void>();

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly proventos = computed(() =>
    (this.item()?.memoria ?? []).filter((l) => l.natureza === 'PROVENTO'),
  );
  protected readonly descontos = computed(() =>
    (this.item()?.memoria ?? []).filter((l) => l.natureza === 'DESCONTO'),
  );
  protected readonly totalProventos = computed(() => soma(this.proventos()));
  protected readonly totalDescontos = computed(() => soma(this.descontos()));

  constructor() {
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.item()) {
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

function soma(linhas: { valor: number }[]): number {
  return Math.round(linhas.reduce((total, l) => total + l.valor, 0) * 100) / 100;
}
