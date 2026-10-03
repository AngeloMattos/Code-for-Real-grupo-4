import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LoginRequest } from '../../../../../core/models/usuario';
import { CampoSenha } from '../campo-senha/campo-senha';
import { RodapeForm } from '../rodape-form/rodape-form';

@Component({
  selector: 'app-form-empresa',
  imports: [ReactiveFormsModule, CampoSenha, RodapeForm],
  templateUrl: './form-empresa.html',
  styles: 'form { display: grid; gap: 16px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormEmpresa {
  readonly carregando = input(false);
  readonly erro = input<string | null>(null);
  readonly enviar = output<LoginRequest>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected submeter(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { email, senha } = this.form.getRawValue();
    this.enviar.emit({ tipo: 'EMPRESA', login: email.trim(), senha });
  }
}
