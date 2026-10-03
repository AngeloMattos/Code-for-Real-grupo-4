import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { EtapaFolha } from '../../../core/models/dashboard';
import { Icone } from '../icone/icone';

const ETAPAS: { id: EtapaFolha; rotulo: string }[] = [
  { id: 'PONTO', rotulo: 'Ponto' },
  { id: 'DOCUMENTOS', rotulo: 'Documentos' },
  { id: 'PREVIA', rotulo: 'Prévia' },
  { id: 'CONFERENCIA', rotulo: 'Conferência' },
  { id: 'FECHADA', rotulo: 'Fechada' },
];

/** Etapas do fechamento: Ponto → Documentos → Prévia → Conferência → Fechada. */
@Component({
  selector: 'app-folha-stepper',
  imports: [Icone],
  templateUrl: './folha-stepper.html',
  styleUrl: './folha-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolhaStepper {
  readonly etapaAtual = input.required<EtapaFolha>();

  protected readonly etapas = computed(() => {
    const atual = ETAPAS.findIndex((e) => e.id === this.etapaAtual());
    const fechada = this.etapaAtual() === 'FECHADA';
    return ETAPAS.map((etapa, i) => ({
      ...etapa,
      numero: i + 1,
      estado: i < atual || fechada ? 'feita' : i === atual ? 'atual' : 'futura',
    }));
  });
}
