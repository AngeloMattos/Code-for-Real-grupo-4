import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse, Usuario } from '../models/usuario';
import { AUTH_API } from './auth.api';

const CHAVE_SESSAO = 'folha-conecta.sessao';

type Sessao = Pick<LoginResponse, 'accessToken' | 'expiraEm' | 'usuario'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AUTH_API);
  private readonly sessao = signal<Sessao | null>(lerSessao());

  readonly usuario = computed<Usuario | null>(() => this.sessao()?.usuario ?? null);
  readonly token = computed(() => this.sessao()?.accessToken ?? null);

  login(req: LoginRequest): Observable<Usuario> {
    return this.api.login(req).pipe(
      tap((resposta) => this.salvar(resposta)),
      map((resposta) => resposta.usuario),
    );
  }

  logout(): void {
    this.sessao.set(null);
    sessionStorage.removeItem(CHAVE_SESSAO);
  }

  /** Sessão existe e o access token ainda não venceu. */
  estaAutenticado(): boolean {
    const atual = this.sessao();
    return atual !== null && new Date(atual.expiraEm).getTime() > Date.now();
  }

  /** Havia sessão, mas o token venceu (usado para o aviso de sessão expirada). */
  sessaoExpirou(): boolean {
    return this.sessao() !== null && !this.estaAutenticado();
  }

  private salvar(resposta: LoginResponse): void {
    const nova: Sessao = {
      accessToken: resposta.accessToken,
      expiraEm: resposta.expiraEm,
      usuario: resposta.usuario,
    };
    this.sessao.set(nova);
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(nova));
  }
}

function lerSessao(): Sessao | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO);
    return bruto ? (JSON.parse(bruto) as Sessao) : null;
  } catch {
    return null;
  }
}
