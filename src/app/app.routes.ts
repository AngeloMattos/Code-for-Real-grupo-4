import { Routes } from '@angular/router'; import { porPapel } from './core/auth/role.guard';
export const routes:Routes=[
 {path:'login',loadComponent:()=>import('./features/auth/login').then(m=>m.Login)},
 {path:'primeiro-acesso',data:{modo:'primeiro'},loadComponent:()=>import('./features/auth/acesso').then(m=>m.Acesso)},
 {path:'recuperar-senha',data:{modo:'recuperar'},loadComponent:()=>import('./features/auth/acesso').then(m=>m.Acesso)},
 {path:'escolher-setor',canMatch:[porPapel()],data:{modo:'setor'},loadComponent:()=>import('./features/auth/acesso').then(m=>m.Acesso)},
 {path:'',canMatch:[porPapel()],loadComponent:()=>import('./layout/app-shell').then(m=>m.AppShell),children:[
  {path:'inicio',loadComponent:()=>import('./features/dashboard/dashboard').then(m=>m.Dashboard)},
  {path:'pendencias/nova',canMatch:[porPapel('RH','FINANCEIRO','CONTABILIDADE')],loadComponent:()=>import('./features/pendencias/nova-pendencia').then(m=>m.NovaPendencia)},
  {path:'pendencias',loadComponent:()=>import('./features/pendencias/central').then(m=>m.Central)},
  {path:'documentos',canMatch:[porPapel('RH')],data:{documentos:true},loadComponent:()=>import('./features/pendencias/central').then(m=>m.Central)},
  {path:'solicitacoes/nova',canMatch:[porPapel('FUNCIONARIO')],loadComponent:()=>import('./features/pendencias/nova-pendencia').then(m=>m.NovaPendencia)},
  {path:'ponto',canMatch:[porPapel('FUNCIONARIO','RH')],loadComponent:()=>import('./features/ponto/ponto').then(m=>m.Ponto)},
  {path:'folha',canMatch:[porPapel('RH','FINANCEIRO','CONTABILIDADE','ADMIN')],loadComponent:()=>import('./features/folha/folha').then(m=>m.Folha)},
  {path:'holerites',canMatch:[porPapel('FUNCIONARIO')],loadComponent:()=>import('./features/funcionario/holerites').then(m=>m.Holerites)},
  {path:'meus-dados',canMatch:[porPapel('FUNCIONARIO')],loadComponent:()=>import('./features/funcionario/meus-dados').then(m=>m.MeusDados)},
  {path:'funcionarios',canMatch:[porPapel('RH','ADMIN')],loadComponent:()=>import('./features/rh/funcionarios').then(m=>m.Funcionarios)},
  {path:'empresas',canMatch:[porPapel('CONTABILIDADE')],loadComponent:()=>import('./features/contabilidade/carteira').then(m=>m.Carteira)},
  {path:'admin/usuarios',canMatch:[porPapel('ADMIN')],loadComponent:()=>import('./features/admin/usuarios').then(m=>m.Usuarios)},
  {path:'admin/empresa',canMatch:[porPapel('ADMIN')],loadComponent:()=>import('./features/admin/empresa').then(m=>m.Empresa)},
  {path:'',pathMatch:'full',redirectTo:'inicio'},
 ]},
 {path:'**',redirectTo:'inicio'}
];
