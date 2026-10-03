package br.com.folhaconecta.folha;
import org.springframework.boot.context.properties.ConfigurationProperties; import java.math.*; import java.util.*;
@ConfigurationProperties("app.fiscal")
public record TabelasFiscais(int ano,List<Faixa> inss,List<Faixa> irrf,BigDecimal isencao,BigDecimal limiteReducao,BigDecimal reducaoConstante,BigDecimal reducaoCoeficiente){
 public record Faixa(BigDecimal limite,BigDecimal aliquota,BigDecimal deducao){}
 public BigDecimal inss(BigDecimal base){BigDecimal anterior=BigDecimal.ZERO,total=BigDecimal.ZERO;for(var faixa:inss){var parcela=base.min(faixa.limite()).subtract(anterior).max(BigDecimal.ZERO);total=total.add(parcela.multiply(faixa.aliquota()));anterior=faixa.limite();}return arredondar(total);}
 public BigDecimal irrf(BigDecimal base,BigDecimal bruto){
  var faixa=irrf.stream().filter(f->base.compareTo(f.limite())<=0).findFirst().orElse(irrf.get(irrf.size()-1));
  var imposto=base.max(BigDecimal.ZERO).multiply(faixa.aliquota()).subtract(faixa.deducao()).max(BigDecimal.ZERO);
  if(bruto.compareTo(isencao)<=0)return arredondar(BigDecimal.ZERO);
  if(bruto.compareTo(limiteReducao)<=0)imposto=imposto.subtract(reducaoConstante.subtract(reducaoCoeficiente.multiply(bruto)).max(BigDecimal.ZERO)).max(BigDecimal.ZERO);
  return arredondar(imposto);
 }
 public static BigDecimal arredondar(BigDecimal valor){return valor.setScale(2,RoundingMode.HALF_EVEN);}
}
