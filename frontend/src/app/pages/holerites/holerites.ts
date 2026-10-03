import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { HOLERITE_API } from '../../core/api/holerite.api';
import { nomeCompetencia } from '../../core/competencia';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icone } from '../../shared/components/icone/icone';
import { PageHeader } from '../../shared/components/page-header/page-header';

/** /holerites: lista dos holerites publicados e o detalhe do escolhido. */
@Component({
  selector: 'app-holerites',
  imports: [CurrencyPipe, DatePipe, EmptyState, Icone, PageHeader],
  templateUrl: './holerites.html',
  styleUrl: './holerites.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Holerites {
  private readonly api = inject(HOLERITE_API);

  protected readonly holerites = rxResource({ stream: () => this.api.meus() });

  private readonly lista = computed(() => this.holerites.value() ?? []);

  /** Começa no mais recente. */
  protected readonly selecionada = linkedSignal(() => this.lista()[0]?.competencia ?? null);

  protected readonly holerite = computed(
    () => this.lista().find((h) => h.competencia === this.selecionada()) ?? null,
  );

  protected readonly proventos = computed(
    () => this.holerite()?.linhas.filter((l) => l.natureza === 'PROVENTO') ?? [],
  );
  protected readonly descontos = computed(
    () => this.holerite()?.linhas.filter((l) => l.natureza === 'DESCONTO') ?? [],
  );

  protected readonly nomeCompetencia = nomeCompetencia;
}
