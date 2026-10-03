import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { USUARIOS_DEMO, UsuarioDemo } from '../../../core/auth/auth.api.fake';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest, TipoLogin } from '../../../core/models/usuario';
import { Icone } from '../../../shared/components/icone/icone';

const CPF_FORMATADO = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NgTemplateOutlet, Icone],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly aba = signal<TipoLogin>('FUNCIONARIO');
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly senhaVisivel = signal(false);
  protected readonly sessaoExpirada = this.params.has('expirada');

  // "Para a apresentação": só no ambiente de demonstração (docs/Desgin.md §4).
  protected readonly demos = environment.demo
    ? USUARIOS_DEMO.filter((u) => u.papel !== 'ADMIN')
    : [];

  protected readonly funcionarioForm = this.fb.group({
    cpf: ['', [Validators.required, Validators.pattern(CPF_FORMATADO)]],
    senha: ['', Validators.required],
  });

  protected readonly empresaForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly mensagemCredenciais = computed(() =>
    this.aba() === 'FUNCIONARIO' ? 'CPF ou senha inválidos.' : 'E-mail ou senha inválidos.',
  );

  protected trocarAba(aba: TipoLogin): void {
    if (this.aba() === aba) return;
    this.aba.set(aba);
    this.erro.set(null);
    this.senhaVisivel.set(false);
  }

  /** Setas esquerda/direita alternam as abas (padrão WAI-ARIA de tabs). */
  protected navegarAbas(evento: KeyboardEvent): void {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    const proxima: TipoLogin = this.aba() === 'FUNCIONARIO' ? 'EMPRESA' : 'FUNCIONARIO';
    this.trocarAba(proxima);
    document.getElementById(`aba-${proxima}`)?.focus();
  }

  protected formatarCpf(evento: Event): void {
    const digitos = (evento.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11);
    const formatado = digitos
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    this.funcionarioForm.controls.cpf.setValue(formatado);
  }

  protected entrar(): void {
    if (this.aba() === 'FUNCIONARIO') {
      const form = this.funcionarioForm;
      if (form.invalid) return form.markAllAsTouched();
      this.enviar({ tipo: 'FUNCIONARIO', login: form.controls.cpf.value, senha: form.controls.senha.value });
    } else {
      const form = this.empresaForm;
      if (form.invalid) return form.markAllAsTouched();
      this.enviar({ tipo: 'EMPRESA', login: form.controls.email.value.trim(), senha: form.controls.senha.value });
    }
  }

  protected entrarComoDemo(demo: UsuarioDemo): void {
    this.trocarAba(demo.tipo);
    this.enviar({ tipo: demo.tipo, login: demo.login, senha: demo.senha });
  }

  private enviar(req: LoginRequest): void {
    if (this.carregando()) return;
    this.erro.set(null);
    this.carregando.set(true);

    this.auth
      .login(req)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.destino()),
        error: (e: unknown) => {
          const credenciais = e instanceof HttpErrorResponse && (e.status === 400 || e.status === 401);
          this.erro.set(
            credenciais
              ? this.mensagemCredenciais()
              : 'Não foi possível entrar agora. Verifique sua conexão e tente de novo.',
          );
        },
      });
  }

  /** Volta para a página guardada antes da sessão expirar; só aceita caminhos internos. */
  private destino(): string {
    const retorno = this.params.get('retorno');
    return retorno?.startsWith('/') && !retorno.startsWith('//') ? retorno : '/inicio';
  }
}
