import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { NOME_SETOR } from '../../core/models/usuario';
import { Icone } from '../../shared/components/icone/icone';

/** Provisório: confirma o login até os dashboards de cada setor ficarem prontos. */
@Component({
  selector: 'app-inicio',
  imports: [Icone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: grid; place-items: center; min-height: 100dvh; padding: 24px 16px; }
    .cartao {
      width: 100%; max-width: 480px; padding: 32px;
      border: 1px solid var(--cor-borda); border-radius: var(--raio-card);
      background: var(--cor-superficie);
    }
    h1 { margin: 0 0 4px; font-size: var(--texto-pagina); font-weight: 600; }
    p { margin: 0 0 24px; color: var(--cor-texto-secundario); }
    .setor {
      display: inline-block; margin-bottom: 16px; padding: 2px 10px; border-radius: 999px;
      color: #fff; font-size: var(--texto-legenda); font-weight: 600;
    }
    button {
      display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px;
      border: 1px solid var(--cor-borda); border-radius: var(--raio-controle);
      background: var(--cor-superficie); font-weight: 500; cursor: pointer;
    }
    button:hover { border-color: var(--cor-marca); color: var(--cor-marca); }
  `,
  template: `
    @if (usuario(); as u) {
      <div class="cartao">
        <span class="setor" [style.background]="corSetor()">{{ nomeSetor() }}</span>
        <h1>Olá, {{ u.nome }}</h1>
        <p>{{ u.empresa?.nomeFantasia }} · O dashboard do seu setor entra aqui.</p>
        <button type="button" (click)="sair()"><app-icone nome="sair" /> Sair</button>
      </div>
    }
  `,
})
export class Inicio {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = this.auth.usuario;
  private readonly papel = computed(() => this.usuario()?.papeis[0] ?? 'FUNCIONARIO');
  protected readonly nomeSetor = computed(() => NOME_SETOR[this.papel()]);
  protected readonly corSetor = computed(() => `var(--setor-${this.papel().toLowerCase()})`);

  protected sair(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
