import { Component, input } from '@angular/core'; import { LucideAngularModule } from 'lucide-angular';
@Component({selector:'fc-icon',imports:[LucideAngularModule],template:`<lucide-icon [name]="nome()" [size]="tamanho()" [strokeWidth]="1.75" aria-hidden="true" />`,host:{'class':'icone'}})
export class Icone { readonly nome=input.required<string>(); readonly tamanho=input(18); }
