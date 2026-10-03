import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { NOME_TIPO, Pendencia } from '../../../core/models/pendencia';
import { TempoRelativoPipe } from '../../pipes/tempo-relativo.pipe';
import { Avatar } from '../avatar/avatar';
import { PrazoLabel } from '../prazo-label/prazo-label';
import { SetorBadge } from '../setor-badge/setor-badge';
import { StatusBadge } from '../status-badge/status-badge';

/** Tabela da Central de Pendências, reaproveitada nos dashboards. */
@Component({
  selector: 'app-pendencias-table',
  imports: [Avatar, PrazoLabel, SetorBadge, StatusBadge, TempoRelativoPipe],
  templateUrl: './pendencias-table.html',
  styleUrl: './pendencias-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendenciasTable {
  readonly pendencias = input.required<Pendencia[]>();
  /** Some na visão do funcionário, que só vê as próprias. */
  readonly mostrarFuncionario = input(true);
  readonly abrir = output<Pendencia>();

  protected readonly nomeTipo = NOME_TIPO;
}
