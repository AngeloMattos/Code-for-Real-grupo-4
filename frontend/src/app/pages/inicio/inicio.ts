import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { DashboardFuncionario } from './components/dashboard-funcionario/dashboard-funcionario';
import { DashboardSetor } from './components/dashboard-setor/dashboard-setor';

/** /inicio: dashboard do setor logado. */
@Component({
  selector: 'app-inicio',
  imports: [DashboardFuncionario, DashboardSetor],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  protected readonly papel = inject(AuthService).papel;
  protected readonly papelSetor = computed(() => {
    const papel = this.papel();
    return papel && papel !== 'FUNCIONARIO' ? papel : null;
  });
}
