import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icone } from '../../../../../shared/components/icone/icone';

/** Erro genérico logo acima do botão, sem dizer qual campo errou. */
@Component({
  selector: 'app-rodape-form',
  imports: [Icone],
  templateUrl: './rodape-form.html',
  styles: ':host { display: grid; gap: 16px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RodapeForm {
  readonly erro = input<string | null>(null);
  readonly carregando = input(false);
}
