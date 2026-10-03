import { Component,input } from '@angular/core'; import { Papel,StatusPendencia,setores,status } from '../../core/models/modelos';
@Component({selector:'fc-status',template:`<span class="badge status-{{valor().toLowerCase()}}">{{nomes[valor()]}}</span>`})
export class StatusBadge { readonly valor=input.required<StatusPendencia>(); readonly nomes=status; }
@Component({selector:'fc-setor',template:`<span class="badge setor setor-{{valor().toLowerCase()}}"><span class="dot"></span>{{nomes[valor()]}}</span>`})
export class SetorBadge { readonly valor=input.required<Papel>(); readonly nomes=setores; }
@Component({selector:'fc-avatar',template:`<span class="avatar setor-{{setor().toLowerCase()}}" aria-hidden="true" [class.pequeno]="pequeno()">{{iniciais()}}</span>`})
export class Avatar { readonly nome=input.required<string>(); readonly setor=input<Papel>('FUNCIONARIO'); readonly pequeno=input(false); iniciais(){return this.nome().split(' ').filter(Boolean).map(p=>p[0]).slice(0,2).join('');} }
