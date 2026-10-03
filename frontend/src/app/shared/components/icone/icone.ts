import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NomeIcone =
  | 'logo'
  | 'olho'
  | 'olho-fechado'
  | 'alerta'
  | 'info'
  | 'check'
  | 'sair'
  | 'carregando';

/**
 * Ícones Lucide (traço 1,75) desenhados inline.
 * Quando o lucide-angular for instalado, troque os usos por <lucide-icon>.
 */
@Component({
  selector: 'app-icone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: inline-flex; flex-shrink: 0; }
    svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
    .girando { animation: girar 0.8s linear infinite; }
    @keyframes girar { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .girando { animation: none; } }
  `,
  template: `
    @switch (nome()) {
      @case ('logo') {
        <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      }
      @case ('olho') {
        <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      }
      @case ('olho-fechado') {
        <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
          <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
          <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
          <path d="m2 2 20 20" />
        </svg>
      }
      @case ('alerta') {
        <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      }
      @case ('info') {
        <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      }
      @case ('check') {
        <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      }
      @case ('sair') {
        <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </svg>
      }
      @case ('carregando') {
        <svg class="girando" [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 24 24" [attr.stroke-width]="traco()">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      }
    }
  `,
})
export class Icone {
  readonly nome = input.required<NomeIcone>();
  readonly tamanho = input(16);
  readonly traco = input(1.75);
}
