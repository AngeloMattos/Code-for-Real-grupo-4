import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core'; import { AuthService } from '../../core/auth/auth.service'; import { Papel } from '../../core/models/modelos';
@Directive({selector:'[temPermissao]'})
export class TemPermissaoDirective {
 readonly temPermissao = input.required<Papel[]>(); private auth = inject(AuthService); private template = inject(TemplateRef); private container = inject(ViewContainerRef);
 constructor() { effect(() => { this.container.clear(); if (this.auth.tem(...this.temPermissao())) this.container.createEmbeddedView(this.template); }); }
}
