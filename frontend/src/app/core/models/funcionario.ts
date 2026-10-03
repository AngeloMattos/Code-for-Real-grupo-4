// Resumo do funcionário para listas e seletores (sem salário nem documentos).

export interface FuncionarioResumo {
  id: number;
  nome: string;
  /** Setor do funcionário na empresa (Produção, Logística...). */
  departamento: string;
}
