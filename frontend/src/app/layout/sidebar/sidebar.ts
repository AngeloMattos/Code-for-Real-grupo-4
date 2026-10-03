import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ItemMenu } from '../../core/navegacao';
import { Papel, Usuario } from '../../core/models/usuario';
import { Avatar } from '../../shared/components/avatar/avatar';
import { Icone } from '../../shared/components/icone/icone';
import { SetorBadge } from '../../shared/components/setor-badge/setor-badge';

/** Menu lateral fixo de 240 px; abaixo de 1024 px vira gaveta (controlada pelo app-shell). */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Avatar, Icone, SetorBadge],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly itens = input.required<ItemMenu[]>();
  readonly usuario = input.required<Usuario>();
  readonly papel = input.required<Papel>();
  readonly fechar = output<void>();
}
