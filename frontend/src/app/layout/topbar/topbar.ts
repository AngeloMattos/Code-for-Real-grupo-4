import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { CompetenciaService, nomeCompetencia } from '../../core/competencia';
import { NOME_SETOR, Papel, Usuario } from '../../core/models/usuario';
import { NotificacoesService } from '../../core/notificacoes';
import { Avatar } from '../../shared/components/avatar/avatar';
import { Icone } from '../../shared/components/icone/icone';

/** Busca global, seletor de competência, sino e menu do usuário (docs/Desgin.md §5). */
@Component({
  selector: 'app-topbar',
  imports: [Avatar, Icone],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'fecharSeFora($event)',
    '(document:keydown.escape)': 'menuUsuarioAberto.set(false)',
  },
})
export class Topbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly competencia = inject(CompetenciaService);
  protected readonly naoLidas = inject(NotificacoesService).naoLidas;

  readonly usuario = input.required<Usuario>();
  readonly papel = input.required<Papel>();
  readonly abrirMenu = output<void>();

  protected readonly menuUsuarioAberto = signal(false);
  protected readonly nomeCompetencia = nomeCompetencia;
  protected readonly nomeSetor = NOME_SETOR;

  protected buscar(evento: Event, termo: string): void {
    evento.preventDefault();
    const q = termo.trim();
    this.router.navigate(['/pendencias'], { queryParams: q ? { q } : {} });
  }

  protected trocarCompetencia(valor: string): void {
    this.competencia.atual.set(valor);
  }

  protected sair(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  protected fecharSeFora(evento: MouseEvent): void {
    const menu = this.elemento.nativeElement.querySelector('.usuario');
    if (this.menuUsuarioAberto() && !menu?.contains(evento.target as Node)) {
      this.menuUsuarioAberto.set(false);
    }
  }
}
