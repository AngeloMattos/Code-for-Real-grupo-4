import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { USUARIOS_DEMO, UsuarioDemo } from '../../../core/auth/auth.api.fake';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest, TipoLogin } from '../../../core/models/usuario';
import { Icone } from '../../../shared/components/icone/icone';
import { AcessosDemo } from './components/acessos-demo/acessos-demo';
import { FormEmpresa } from './components/form-empresa/form-empresa';
import { FormFuncionario } from './components/form-funcionario/form-funcionario';
import { PainelMarca } from './components/painel-marca/painel-marca';
import { SeletorAcesso } from './components/seletor-acesso/seletor-acesso';

const ERRO_CONEXAO = 'Não foi possível entrar agora. Verifique sua conexão e tente de novo.';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    Icone,
    PainelMarca,
    SeletorAcesso,
    FormFuncionario,
    FormEmpresa,
    AcessosDemo,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly aba = signal<TipoLogin>('FUNCIONARIO');
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly sessaoExpirada = this.params.has('expirada');

  protected readonly demos = environment.demo
    ? USUARIOS_DEMO.filter((u) => u.papel !== 'ADMIN')
    : [];

  private readonly mensagemCredenciais = computed(() =>
    this.aba() === 'FUNCIONARIO' ? 'CPF ou senha inválidos.' : 'E-mail ou senha inválidos.',
  );

  protected trocarAba(aba: TipoLogin): void {
    if (this.aba() === aba) return;
    this.aba.set(aba);
    this.erro.set(null);
  }

  protected entrarComoDemo(demo: UsuarioDemo): void {
    this.trocarAba(demo.tipo);
    this.enviar({ tipo: demo.tipo, login: demo.login, senha: demo.senha });
  }

  protected enviar(req: LoginRequest): void {
    if (this.carregando()) return;
    this.erro.set(null);
    this.carregando.set(true);

    this.auth
      .login(req)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.destino()),
        error: (e: unknown) => this.erro.set(this.mensagemDeErro(e)),
      });
  }

  private mensagemDeErro(e: unknown): string {
    const credenciais = e instanceof HttpErrorResponse && (e.status === 400 || e.status === 401);
    return credenciais ? this.mensagemCredenciais() : ERRO_CONEXAO;
  }

  /** Volta para a página guardada antes da sessão expirar; só aceita caminhos internos. */
  private destino(): string {
    const retorno = this.params.get('retorno');
    return retorno?.startsWith('/') && !retorno.startsWith('//') ? retorno : '/inicio';
  }
}
