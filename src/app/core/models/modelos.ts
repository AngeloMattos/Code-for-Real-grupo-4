export type Papel = 'FUNCIONARIO' | 'RH' | 'FINANCEIRO' | 'CONTABILIDADE' | 'ADMIN';
export type StatusPendencia = 'ABERTA' | 'EM_ANALISE' | 'CORRECAO_SOLICITADA' | 'CONCLUIDA' | 'CANCELADA';
export type TipoPendencia = 'ATESTADO' | 'FERIAS' | 'ALTERACAO_CADASTRAL' | 'DUVIDA' | 'AJUSTE_PONTO' | 'DOCUMENTO_SOLICITADO' | 'CORRECAO_FOLHA';
export interface EmpresaResumo { id: number; nome: string; }
export interface Usuario { id: number; nome: string; papeis: Papel[]; empresa: EmpresaResumo; funcionarioId: number | null; empresas: EmpresaResumo[]; }
export interface Sessao { accessToken: string; expiraEm: string; usuario: Usuario; }
export interface Pagina<T> { content: T[]; number: number; size: number; totalElements: number; totalPages: number; }
export interface Documento { id: number; nomeOriginal: string; contentType: string; tamanhoBytes: number; sensivel: boolean; }
export interface Pendencia {
 id: number; titulo: string; descricao: string; tipo: TipoPendencia; status: StatusPendencia; setorResponsavel: Papel; responsavelNome: string | null;
 funcionarioId: number; funcionarioNome: string; prazo: string; atrasada: boolean; competencia: string; bloqueiaFolha: boolean; abonado: boolean;
 dataInicio: string | null; dataFim: string | null; criadoEm: string; ultimaAtualizacao: string; criadoPor: string; documentos: Documento[];
}
export interface Evento { id: number; tipo: string; statusAnterior: StatusPendencia | null; statusNovo: StatusPendencia; comentario: string; autor: string; papeis: Papel[]; criadoEm: string; }
export interface Funcionario { id: number; usuarioId:number|null; nome: string; cpf: string; matricula: string; cargo: string; departamento: string; salarioBase: number | null; cargaHorariaMensal: number; dataAdmissao: string; ativo: boolean; }
export interface Ponto { id: number | null; funcionarioId: number; funcionarioNome: string; data: string; entrada: string | null; saida: string | null; totalHoras: number; horasExtras: number; inconsistente: boolean; ajustado: boolean; justificativa: string | null; }
export type StatusFolha = 'ABERTA' | 'PREVIA_CALCULADA' | 'EM_CONFERENCIA' | 'FECHADA';
export interface Folha { id: number | null; competencia: string; status: StatusFolha; calculadaEm: string | null; fechadaEm: string | null; bloqueada: boolean; bloqueios: Pendencia[]; etapas: string[]; etapaAtual: number; }
export interface ItemFolha { id: number; funcionarioId: number; funcionarioNome: string; competencia: string; salarioBase: number; horasExtras: number; valorHorasExtras: number; diasFalta: number; valorFaltas: number; inss: number; irrf: number; valeTransporte: number; liquido: number; memoriaCalculo: string; publicado: boolean; situacao: string; }
export interface Dashboard { abertas: number; vencemEmTresDias: number; atrasadas: number; aguardandoValidacao: number; precisaAcao: Pendencia[]; atividades: Evento[]; folha: Folha | null; hoje: string; }
export interface Empresa extends EmpresaResumo { razaoSocial: string; cnpj: string; diaFechamento: number; statusFolha: StatusFolha; pendenciasAbertas: number; prazoFechamento: string; }
export interface Notificacao { id: number; titulo: string; mensagem: string; link: string; lida: boolean; criadoEm: string; }
export interface UsuarioAdmin { id: number; nome: string; email: string | null; cpf: string | null; papeis: Papel[]; ativo: boolean; }
export const setores: Record<Papel, string> = { FUNCIONARIO: 'Funcionário', RH: 'RH', FINANCEIRO: 'Financeiro', CONTABILIDADE: 'Contabilidade', ADMIN: 'Admin' };
export const status: Record<StatusPendencia, string> = { ABERTA: 'Aberta', EM_ANALISE: 'Em análise', CORRECAO_SOLICITADA: 'Correção solicitada', CONCLUIDA: 'Concluída', CANCELADA: 'Cancelada' };
export const tipos: Record<TipoPendencia, string> = { ATESTADO: 'Atestado', FERIAS: 'Férias', ALTERACAO_CADASTRAL: 'Alteração cadastral', DUVIDA: 'Dúvida', AJUSTE_PONTO: 'Ajuste de ponto', DOCUMENTO_SOLICITADO: 'Documento solicitado', CORRECAO_FOLHA: 'Correção da folha' };
export const statusFolha: Record<StatusFolha,string> = { ABERTA:'Em preparação',PREVIA_CALCULADA:'Prévia calculada',EM_CONFERENCIA:'Em conferência',FECHADA:'Fechada' };
