package br.com.folhaconecta.folha.dto;
import br.com.folhaconecta.folha.ItemFolha; import java.math.BigDecimal;
public record ItemFolhaResponse(Long id,Long funcionarioId,String funcionarioNome,String competencia,BigDecimal salarioBase,BigDecimal horasExtras,BigDecimal valorHorasExtras,int diasFalta,BigDecimal valorFaltas,BigDecimal inss,BigDecimal irrf,BigDecimal valeTransporte,BigDecimal liquido,String memoriaCalculo,boolean publicado,String situacao){
 public static ItemFolhaResponse de(ItemFolha item,String situacao){return new ItemFolhaResponse(item.getId(),item.getFuncionario().getId(),item.getFuncionario().getNome(),item.getFolha().getCompetencia(),item.getSalarioBase(),item.getHorasExtras(),item.getValorHorasExtras(),item.getDiasFalta(),item.getValorFaltas(),item.getInss(),item.getIrrf(),item.getValeTransporte(),item.getLiquido(),item.getMemoriaCalculo(),item.isPublicado(),situacao);}
}
