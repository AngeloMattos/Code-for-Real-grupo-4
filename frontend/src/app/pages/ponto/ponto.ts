import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { MeuPonto } from './components/meu-ponto/meu-ponto';
import { PontoEquipe } from './components/ponto-equipe/ponto-equipe';

/** /ponto: ponto da equipe para o RH; "meu ponto" para o funcionário. */
@Component({
  selector: 'app-ponto',
  imports: [MeuPonto, PontoEquipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (papel() === 'FUNCIONARIO') {
      <app-meu-ponto />
    } @else {
      <app-ponto-equipe />
    }
  `,
})
export class Ponto {
  protected readonly papel = inject(AuthService).papel;
}
