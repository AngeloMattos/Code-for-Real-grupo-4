import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LoginRequest } from '../../../../../core/models/usuario';
import { CampoSenha } from '../campo-senha/campo-senha';
import { RodapeForm } from '../rodape-form/rodape-form';

const CPF_FORMATADO = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

@Component({
  selector: 'app-form-funcionario',
  imports: [ReactiveFormsModule, CampoSenha, RodapeForm],
  templateUrl: './form-funcionario.html',
  styles: 'form { display: grid; gap: 16px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFuncionario {
  readonly carregando = input(false);
  readonly erro = input<string | null>(null);
  readonly enviar = output<LoginRequest>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    cpf: ['', [Validators.required, Validators.pattern(CPF_FORMATADO)]],
    senha: ['', Validators.required],
  });

  protected formatarCpf(evento: Event): void {
    const digitos = (evento.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11);
    const formatado = digitos
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    this.form.controls.cpf.setValue(formatado);
  }

  protected submeter(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { cpf, senha } = this.form.getRawValue();
    this.enviar.emit({ tipo: 'FUNCIONARIO', login: cpf, senha });
  }
}
