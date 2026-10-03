// Espelha os enums e DTOs do Spring (docs/BACKEND.md §5 e §7).

export type Papel = 'FUNCIONARIO' | 'RH' | 'FINANCEIRO' | 'CONTABILIDADE' | 'ADMIN';

export type TipoLogin = 'FUNCIONARIO' | 'EMPRESA';

export interface EmpresaResumo {
  id: number;
  nomeFantasia: string;
}

export interface Usuario {
  nome: string;
  papeis: Papel[];
  empresa: EmpresaResumo | null;
}

export interface LoginRequest {
  tipo: TipoLogin;
  login: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  expiraEm: string;
  usuario: Usuario;
}

export const NOME_SETOR: Record<Papel, string> = {
  FUNCIONARIO: 'Funcionário',
  RH: 'RH',
  FINANCEIRO: 'Financeiro',
  CONTABILIDADE: 'Contabilidade',
  ADMIN: 'Admin',
};
