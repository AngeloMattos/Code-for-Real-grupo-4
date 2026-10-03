import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { UsuarioDemo } from '../../../../../core/auth/auth.api.fake';

/** "Para a apresentação": só aparece no ambiente de demonstração (docs/Desgin.md §4). */
@Component({
  selector: 'app-acessos-demo',
  templateUrl: './acessos-demo.html',
  styleUrl: './acessos-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcessosDemo {
  readonly demos = input.required<UsuarioDemo[]>();
  readonly carregando = input(false);
  readonly escolher = output<UsuarioDemo>();
}
