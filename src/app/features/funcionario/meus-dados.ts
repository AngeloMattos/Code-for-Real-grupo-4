import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { API } from '../../core/api/api.service';
import { UiService } from '../../core/ui.service';
import { Funcionario } from '../../core/models/modelos';
import { PageHeader } from '../../shared/components/page-header';
import { Skeleton } from '../../shared/components/estados';
import { Icone } from '../../shared/components/icone';

@Component({selector:'fc-meus-dados',imports:[CurrencyPipe,DatePipe,RouterLink,PageHeader,Skeleton,Icone],template:`
 <fc-page-header titulo="Meus dados" descricao="Confira seu cadastro e solicite ao RH uma atualização quando precisar."/>
 @if(carregando()){<fc-skeleton/>}@else if(erro()){
  <div class="error-state" role="alert">{{erro()}}<button class="button" (click)="carregar()">Tentar de novo</button></div>
 }@else if(dados();as d){
  <section class="card profile-card"><div class="profile-heading"><span class="holerite-icon"><fc-icon nome="user-round" [tamanho]="28"/></span><div><h2>{{d.nome}}</h2><p class="muted">{{d.cargo}} · {{d.departamento}}</p></div><span class="badge status-concluida">{{d.ativo?'Ativo':'Inativo'}}</span></div>
  <dl class="profile-details"><div><dt>CPF</dt><dd>{{cpf(d.cpf)}}</dd></div><div><dt>Matrícula</dt><dd>{{d.matricula}}</dd></div><div><dt>Admissão</dt><dd>{{d.dataAdmissao|date:'dd/MM/yyyy'}}</dd></div><div><dt>Carga horária mensal</dt><dd>{{d.cargaHorariaMensal}} horas</dd></div><div><dt>Salário base</dt><dd>{{d.salarioBase|currency:'BRL'}}</dd></div><div><dt>Departamento</dt><dd>{{d.departamento}}</dd></div></dl>
  <p class="notice neutral">Seu cadastro é atualizado pelo RH. Envie uma solicitação de alteração cadastral com as informações que precisam de correção.</p>
  <a class="button primary" routerLink="/solicitacoes/nova" [queryParams]="{tipo:'ALTERACAO_CADASTRAL'}"><fc-icon nome="pencil"/>Solicitar atualização</a></section>
 }`})
export class MeusDados {
 private api=inject(API); private ui=inject(UiService);
 readonly dados=signal<Funcionario|null>(null); readonly carregando=signal(true); readonly erro=signal('');
 constructor(){void this.carregar();}
 cpf(valor:string){return valor.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');}
 async carregar(){this.carregando.set(true);this.erro.set('');try{this.dados.set(await this.api.get<Funcionario>('/funcionarios/me'));}catch(e){this.erro.set(this.ui.mensagem(e));}finally{this.carregando.set(false);}}
}
