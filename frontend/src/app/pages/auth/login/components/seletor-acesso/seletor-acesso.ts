import { ChangeDetectionStrategy, Component, model } from '@angular/core';

import { TipoLogin } from '../../../../../core/models/usuario';

/** Abas "Sou funcionário" / "Sou empresa" (padrão WAI-ARIA de tabs). */
@Component({
  selector: 'app-seletor-acesso',
  templateUrl: './seletor-acesso.html',
  styleUrl: './seletor-acesso.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeletorAcesso {
  readonly aba = model.required<TipoLogin>();

  protected readonly opcoes: { tipo: TipoLogin; rotulo: string }[] = [
    { tipo: 'FUNCIONARIO', rotulo: 'Sou funcionário' },
    { tipo: 'EMPRESA', rotulo: 'Sou empresa' },
  ];

  /** Setas esquerda/direita alternam as abas. */
  protected navegar(evento: KeyboardEvent): void {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    const proxima: TipoLogin = this.aba() === 'FUNCIONARIO' ? 'EMPRESA' : 'FUNCIONARIO';
    this.aba.set(proxima);
    document.getElementById(`aba-${proxima}`)?.focus();
  }
}
