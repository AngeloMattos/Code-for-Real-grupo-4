import { Component,input,output } from '@angular/core'; import { Icone } from './icone';
@Component({selector:'fc-empty',imports:[Icone],template:`<div class="empty-state"><fc-icon nome="circle-check" [tamanho]="36"/><h3>{{titulo()}}</h3><p>{{descricao()}}</p>@if(acao()){<button class="button primary" (click)="agir.emit()">{{acao()}}</button>}</div>`})
export class EmptyState { readonly titulo=input('Tudo em dia!'); readonly descricao=input('Nenhuma pendência encontrada.'); readonly acao=input(''); readonly agir=output<void>(); }
@Component({selector:'fc-skeleton',template:`<div class="skeleton-grid" aria-label="Carregando" role="status">@for(linha of linhas;track linha){<div class="skeleton"></div>}</div>`})
export class Skeleton { readonly linhas=[1,2,3,4]; }
