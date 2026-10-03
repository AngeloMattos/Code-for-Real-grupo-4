import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SOLICITACAO_API, SolicitacaoEnviada } from '../../core/api/solicitacao.api';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icone } from '../../shared/components/icone/icone';
import { PageHeader } from '../../shared/components/page-header/page-header';

const TIPOS_ACEITOS = ['application/pdf', 'image/jpeg', 'image/png'];
const TAMANHO_MAXIMO = 10 * 1024 * 1024;

/** /solicitacoes/nova: o funcionário envia um documento ao RH (título, destino e arquivo). */
@Component({
  selector: 'app-enviar-documento',
  imports: [ReactiveFormsModule, RouterLink, EmptyState, Icone, PageHeader],
  templateUrl: './enviar-documento.html',
  styleUrl: './enviar-documento.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnviarDocumento {
  private readonly api = inject(SOLICITACAO_API);

  protected readonly form = inject(NonNullableFormBuilder).group({
    // "Pedir ajuste" no ponto já chega com o título preenchido.
    titulo: [
      inject(ActivatedRoute).snapshot.queryParamMap.get('titulo') ?? '',
      [Validators.required, Validators.maxLength(120)],
    ],
    destino: ['RH' as const, Validators.required],
  });

  protected readonly arquivo = signal<File | null>(null);
  protected readonly erroArquivo = signal<string | null>(null);
  protected readonly arrastando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erroEnvio = signal<string | null>(null);
  protected readonly enviada = signal<SolicitacaoEnviada | null>(null);

  // ---------- Arquivo ----------

  protected aoArrastar(evento: DragEvent, dentro: boolean): void {
    evento.preventDefault();
    this.arrastando.set(dentro);
  }

  protected aoSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastando.set(false);
    const arquivo = evento.dataTransfer?.files[0];
    if (arquivo) this.escolher(arquivo);
  }

  protected aoSelecionar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (arquivo) this.escolher(arquivo);
    input.value = ''; // permite escolher o mesmo arquivo de novo depois de remover
  }

  protected remover(): void {
    this.arquivo.set(null);
  }

  private escolher(arquivo: File): void {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      this.erroArquivo.set('Envie um arquivo PDF, JPG ou PNG.');
    } else if (arquivo.size > TAMANHO_MAXIMO) {
      this.erroArquivo.set('O arquivo passa de 10 MB.');
    } else {
      this.erroArquivo.set(null);
      this.arquivo.set(arquivo);
    }
  }

  /** 1536000 → "1,5 MB". */
  protected tamanho(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  }

  // ---------- Envio ----------

  protected enviar(): void {
    const arquivo = this.arquivo();
    if (!arquivo && !this.erroArquivo()) this.erroArquivo.set('Anexe o documento.');
    if (this.form.invalid || !arquivo) return this.form.markAllAsTouched();

    this.enviando.set(true);
    this.erroEnvio.set(null);
    const { titulo, destino } = this.form.getRawValue();
    this.api.enviar({ titulo: titulo.trim(), destino, arquivo }).subscribe({
      next: (enviada) => {
        this.enviada.set(enviada);
        this.enviando.set(false);
      },
      error: () => {
        this.erroEnvio.set('Não foi possível enviar. Verifique sua conexão e tente de novo.');
        this.enviando.set(false);
      },
    });
  }

  protected novoEnvio(): void {
    this.form.reset({ titulo: '', destino: 'RH' });
    this.arquivo.set(null);
    this.erroArquivo.set(null);
    this.enviada.set(null);
  }
}
