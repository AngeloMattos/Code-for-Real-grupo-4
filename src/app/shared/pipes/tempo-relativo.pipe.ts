import { Pipe,PipeTransform,inject } from '@angular/core'; import { UiService } from '../../core/ui.service';
@Pipe({name:'tempoRelativo'})
export class TempoRelativoPipe implements PipeTransform {private ui=inject(UiService); transform(valor:string){const hoje=new Date();const referencia=new Date(this.ui.hoje()+'T'+hoje.toTimeString().slice(0,8));const minutos=Math.max(0,Math.floor((referencia.getTime()-Date.parse(valor))/60000));return minutos<1?'Agora':minutos<60?`Há ${minutos} min`:minutos<1440?`Há ${Math.floor(minutos/60)} h`:`Há ${Math.floor(minutos/1440)} dias`;} }
