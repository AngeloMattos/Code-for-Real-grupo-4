import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FUNCIONARIO_API } from '../../core/api/funcionario.api';
import { PENDENCIA_API } from '../../core/api/pendencia.api';
import { AuthService } from '../../core/auth/auth.service';
import { CompetenciaService } from '../../core/competencia';
import { NOME_TIPO, Pendencia, TipoPendencia } from '../../core/models/pendencia';
import { NOME_SETOR, Papel } from '../../core/models/usuario';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icone } from '../../shared/components/icone/icone';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { PrazoLabel } from '../../shared/components/prazo-label/prazo-label';
import { SetorBadge } from '../../shared/components/setor-badge/setor-badge';

type SetorCriador = 'RH' | 'FINANCEIRO' | 'CONTABILIDADE';

/** O que cada setor costuma abrir (docs/Desgin.md §3). O back valida de novo. */
const TIPOS_POR_SETOR: Record<SetorCriador, TipoPendencia[]> = {
  RH: ['DOCUMENTO_SOLICITADO', 'AJUSTE_PONTO', 'ATESTADO', 'FERIAS', 'ALTERACAO_CADASTRAL', 'CORRECAO_FOLHA', 'DUVIDA'],
  FINANCEIRO: ['CORRECAO_FOLHA', 'AJUSTE_PONTO', 'DOCUMENTO_SOLICITADO', 'DUVIDA'],
  CONTABILIDADE: ['DOCUMENTO_SOLICITADO', 'CORRECAO_FOLHA', 'DUVIDA'],
};

/** Com quem a pendência costuma começar, por tipo. */
const SETOR_PADRAO: Record<TipoPendencia, Papel> = {
  ATESTADO: 'RH',
  FERIAS: 'RH',
  ALTERACAO_CADASTRAL: 'FUNCIONARIO',
  DUVIDA: 'RH',
  AJUSTE_PONTO: 'RH',
  DOCUMENTO_SOLICITADO: 'FUNCIONARIO',
  CORRECAO_FOLHA: 'FINANCEIRO',
};

/** Atestado, férias e ajuste de ponto nascem bloqueando a folha; dúvida não (docs/BACKEND.md §9). */
const BLOQUEIA_PADRAO: Record<TipoPendencia, boolean> = {
  ATESTADO: true,
  FERIAS: true,
  AJUSTE_PONTO: true,
  DOCUMENTO_SOLICITADO: true,
  CORRECAO_FOLHA: true,
  ALTERACAO_CADASTRAL: false,
  DUVIDA: false,
};

const EXEMPLO_TITULO: Record<TipoPendencia, string> = {
  ATESTADO: 'Ex.: Atestado médico de 13/10 a 14/10',
  FERIAS: 'Ex.: Férias de 03/11 a 17/11',
  ALTERACAO_CADASTRAL: 'Ex.: Atualizar conta bancária',
  DUVIDA: 'Ex.: Desconto de VT no holerite',
  AJUSTE_PONTO: 'Ex.: Saída faltando em 02/10',
  DOCUMENTO_SOLICITADO: 'Ex.: Comprovante de residência atualizado',
  CORRECAO_FOLHA: 'Ex.: Divergência no INSS de setembro',
};

const DESTINOS: Papel[] = ['FUNCIONARIO', 'RH', 'FINANCEIRO', 'CONTABILIDADE'];

function hojeIso(somarDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + somarDias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** @FutureOrPresent do back: prazo hoje ou depois. */
function prazoNaoPassado(controle: AbstractControl<string>): ValidationErrors | null {
  return controle.value && controle.value < hojeIso() ? { passado: true } : null;
}

/** "2026-10-02" → "02/10". */
function diaMes(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

/**
 * /pendencias/nova: RH, Financeiro e Contabilidade abrem e atribuem uma pendência
 * (POST /pendencias). O funcionário usa /solicitacoes/nova.
 */
@Component({
  selector: 'app-nova-pendencia',
  imports: [ReactiveFormsModule, RouterLink, EmptyState, Icone, PageHeader, PrazoLabel, SetorBadge],
  templateUrl: './nova-pendencia.html',
  styleUrl: './nova-pendencia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovaPendencia {
  private readonly api = inject(PENDENCIA_API);
  private readonly funcionarioApi = inject(FUNCIONARIO_API);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;
  protected readonly competencia = inject(CompetenciaService);

  protected readonly nomeTipo = NOME_TIPO;
  protected readonly nomeSetor = NOME_SETOR;
  protected readonly destinos = DESTINOS;
  protected readonly hoje = hojeIso();

  private readonly papel = inject(AuthService).papel;
  protected readonly tipos = computed(
    () => TIPOS_POR_SETOR[(this.papel() ?? 'RH') as SetorCriador] ?? TIPOS_POR_SETOR.RH,
  );

  protected readonly funcionarios = rxResource({
    stream: () => this.funcionarioApi.listar(),
  });

  /** Funcionários agrupados por setor da empresa, para o <optgroup>. */
  protected readonly gruposFuncionarios = computed(() => {
    const grupos = new Map<string, { id: number; nome: string }[]>();
    for (const f of this.funcionarios.value() ?? []) {
      if (!grupos.has(f.departamento)) grupos.set(f.departamento, []);
      grupos.get(f.departamento)!.push(f);
    }
    return [...grupos.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([departamento, lista]) => ({ departamento, lista }));
  });

  // ---------- Formulário (pré-preenchido quando vem do Ponto) ----------

  /** "Criar pendência" no Ponto da equipe manda tipo, funcionário e dia. */
  private readonly diaDoPonto = this.params.get('data');
  protected readonly veioDoPonto = this.diaDoPonto !== null;

  private readonly tipoInicial: TipoPendencia = (() => {
    const tipo = this.params.get('tipo') as TipoPendencia | null;
    return tipo && this.tipos().includes(tipo) ? tipo : this.tipos()[0];
  })();

  protected readonly form = inject(NonNullableFormBuilder).group({
    tipo: [this.tipoInicial, Validators.required],
    funcionarioId: [Number(this.params.get('funcionarioId')) || (null as number | null), Validators.required],
    titulo: [
      this.diaDoPonto ? `Marcação faltando em ${diaMes(this.diaDoPonto)}` : '',
      [Validators.required, Validators.maxLength(120)],
    ],
    descricao: [
      this.diaDoPonto
        ? `O ponto de ${diaMes(this.diaDoPonto)} está sem entrada ou sem saída. Confirme o horário com o gestor e ajuste com justificativa.`
        : '',
      Validators.maxLength(1000),
    ],
    setorResponsavel: [this.setorPadrao(this.tipoInicial), Validators.required],
    prazo: [hojeIso(3), [Validators.required, prazoNaoPassado]],
    bloqueiaFolha: [BLOQUEIA_PADRAO[this.tipoInicial]],
  });

  /** Valores atuais como signal, para o resumo ao lado. */
  protected readonly valores = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly resumo = computed(() => {
    const v = { ...this.form.getRawValue(), ...this.valores() };
    const funcionario = (this.funcionarios.value() ?? []).find((f) => f.id === v.funcionarioId);
    return { ...v, funcionarioNome: funcionario?.nome ?? null };
  });

  protected readonly exemploTitulo = computed(() => EXEMPLO_TITULO[this.resumo().tipo ?? 'DUVIDA']);

  constructor() {
    // Troca de tipo ajusta "com quem fica" e "bloqueia a folha", a menos que a pessoa já tenha mexido.
    this.form.controls.tipo.valueChanges.pipe(takeUntilDestroyed()).subscribe((tipo) => {
      const { setorResponsavel, bloqueiaFolha } = this.form.controls;
      if (setorResponsavel.pristine) setorResponsavel.setValue(this.setorPadrao(tipo));
      if (bloqueiaFolha.pristine) bloqueiaFolha.setValue(BLOQUEIA_PADRAO[tipo]);
    });
  }

  /** A Contabilidade conversa com o RH, não direto com o funcionário (docs/BACKEND.md §9). */
  private setorPadrao(tipo: TipoPendencia): Papel {
    const padrao = SETOR_PADRAO[tipo];
    return this.papel() === 'CONTABILIDADE' && padrao === 'FUNCIONARIO' ? 'RH' : padrao;
  }

  // ---------- Envio ----------

  protected readonly enviando = signal(false);
  protected readonly erroEnvio = signal<string | null>(null);
  protected readonly criada = signal<(Pendencia & { bloqueiaFolha: boolean }) | null>(null);

  protected abrir(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const v = this.form.getRawValue();
    this.enviando.set(true);
    this.erroEnvio.set(null);
    this.api
      .criar({
        funcionarioId: v.funcionarioId!,
        titulo: v.titulo.trim(),
        descricao: v.descricao.trim() || null,
        tipo: v.tipo,
        setorResponsavel: v.setorResponsavel,
        prazo: v.prazo,
        bloqueiaFolha: v.bloqueiaFolha,
      })
      .subscribe({
        next: (pendencia) => {
          this.criada.set({ ...pendencia, bloqueiaFolha: v.bloqueiaFolha });
          this.enviando.set(false);
        },
        error: () => {
          this.erroEnvio.set('Não foi possível abrir a pendência. Verifique sua conexão e tente de novo.');
          this.enviando.set(false);
        },
      });
  }

  protected abrirOutra(): void {
    const tipo = this.tipos()[0];
    this.form.reset({
      tipo,
      funcionarioId: null,
      titulo: '',
      descricao: '',
      setorResponsavel: this.setorPadrao(tipo),
      prazo: hojeIso(3),
      bloqueiaFolha: BLOQUEIA_PADRAO[tipo],
    });
    this.criada.set(null);
  }

  protected invalido(nome: keyof NovaPendencia['form']['controls']): boolean {
    const controle = this.form.controls[nome];
    return controle.touched && controle.invalid;
  }
}
