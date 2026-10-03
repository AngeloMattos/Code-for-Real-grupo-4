import { Component,input } from '@angular/core';
@Component({selector:'fc-page-header',template:`<header class="page-header"><div><span class="eyebrow">{{contexto()}}</span><h1>{{titulo()}}</h1><p>{{descricao()}}</p></div><div class="header-action"><ng-content/></div></header>`})
export class PageHeader { readonly titulo=input.required<string>();readonly descricao=input('');readonly contexto=input('FOLHA CONECTA'); }
