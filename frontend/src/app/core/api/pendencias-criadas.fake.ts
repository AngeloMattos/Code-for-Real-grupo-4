// Pendências abertas durante a demo. Ficam em memória e entram no pendenciasDemo(),
// então aparecem no dashboard e nos bloqueios da folha. Recarregar a página apaga.
import type { PendenciaDemo } from './dashboard.api.fake';

const criadas: PendenciaDemo[] = [];

export function pendenciasCriadas(): PendenciaDemo[] {
  return criadas;
}

export function guardarPendencia(p: PendenciaDemo): void {
  criadas.push(p);
}
