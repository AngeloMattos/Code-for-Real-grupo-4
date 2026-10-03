import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Icone } from '../../../../../shared/components/icone/icone';

/** Painel lateral com a proposta do produto; some no celular (docs/Desgin.md §4). */
@Component({
  selector: 'app-painel-marca',
  imports: [Icone],
  templateUrl: './painel-marca.html',
  styleUrl: './painel-marca.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PainelMarca {}
