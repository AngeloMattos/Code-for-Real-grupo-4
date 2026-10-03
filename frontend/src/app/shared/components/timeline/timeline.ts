import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Atividade } from '../../../core/models/dashboard';
import { TempoRelativoPipe } from '../../pipes/tempo-relativo.pipe';
import { Avatar } from '../avatar/avatar';

/** Linha do tempo curta: "Maria enviou atestado · há 10 min". */
@Component({
  selector: 'app-timeline',
  imports: [Avatar, TempoRelativoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ol { display: grid; margin: 0; padding: 0; list-style: none; }
    li { position: relative; display: flex; gap: 12px; padding-bottom: 16px; }
    li:last-child { padding-bottom: 0; }
    li:not(:last-child)::before {
      content: '';
      position: absolute;
      top: 32px;
      bottom: 4px;
      left: 13px;
      width: 2px;
      background: var(--cor-borda);
    }
    p { margin: 0; }
    time { font-size: var(--texto-legenda); color: var(--cor-texto-secundario); }
  `,
  template: `
    <ol>
      @for (item of itens(); track item.id) {
        <li>
          <app-avatar [nome]="item.autorNome" [setor]="item.autorSetor" />
          <div>
            <p><strong>{{ item.autorNome }}</strong> {{ item.descricao }}</p>
            <time [attr.datetime]="item.quando">{{ item.quando | tempoRelativo }}</time>
          </div>
        </li>
      }
    </ol>
  `,
})
export class Timeline {
  readonly itens = input.required<Atividade[]>();
}
