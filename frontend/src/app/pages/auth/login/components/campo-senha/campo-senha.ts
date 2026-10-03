import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Icone } from '../../../../../shared/components/icone/icone';

/** Campo de senha com botão de mostrar/ocultar e link "Esqueci minha senha". */
@Component({
  selector: 'app-campo-senha',
  imports: [ReactiveFormsModule, RouterLink, Icone],
  templateUrl: './campo-senha.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoSenha {
  readonly controle = input.required<FormControl<string>>();

  protected readonly visivel = signal(false);
}
