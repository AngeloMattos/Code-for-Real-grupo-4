package br.com.folhaconecta.folha;
import br.com.folhaconecta.funcionario.Funcionario; import br.com.folhaconecta.ponto.dto.ResumoPonto;
import org.springframework.stereotype.Service; import java.math.*; import java.time.*; import java.util.*; import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;
@Service @RequiredArgsConstructor
public class CalculoFolhaService {
 private final TabelasFiscais tabelas; private final ObjectMapper json;
 public ItemFolha calcular(Funcionario funcionario,ResumoPonto ponto,Set<LocalDate> abonados){
  var salario=funcionario.getSalarioBase();var valorHora=salario.divide(BigDecimal.valueOf(funcionario.getCargaHorariaMensal()),6,RoundingMode.HALF_EVEN);
  var extras=TabelasFiscais.arredondar(valorHora.multiply(new BigDecimal("1.5")).multiply(ponto.horasExtras()));
  var datasFalta=ponto.datasFalta().stream().filter(d->!abonados.contains(d)).toList();int diasFalta=datasFalta.size();
  var faltas=TabelasFiscais.arredondar(salario.divide(new BigDecimal("30"),6,RoundingMode.HALF_EVEN).multiply(BigDecimal.valueOf(diasFalta)));
  var bruto=salario.add(extras).subtract(faltas);var inss=tabelas.inss(bruto);var irrf=tabelas.irrf(bruto.subtract(inss),bruto);var transporte=TabelasFiscais.arredondar(salario.multiply(new BigDecimal("0.06")));
  var item=new ItemFolha();item.setEmpresa(funcionario.getEmpresa());item.setFuncionario(funcionario);item.setSalarioBase(salario);item.setHorasExtras(ponto.horasExtras());item.setValorHorasExtras(extras);item.setDiasFalta(diasFalta);item.setValorFaltas(faltas);item.setInss(inss);item.setIrrf(irrf);item.setValeTransporte(transporte);item.setLiquido(TabelasFiscais.arredondar(bruto.subtract(inss).subtract(irrf).subtract(transporte)));
  var memoria=new LinkedHashMap<String,Object>();memoria.put("aviso","Previa simplificada. Nao inclui ferias, 13o, rescisao, adicionais ou dependentes.");memoria.put("anoFiscal",tabelas.ano());memoria.put("salarioBase",salario);memoria.put("cargaHoraria",funcionario.getCargaHorariaMensal());memoria.put("horasExtras",ponto.horasExtras());memoria.put("datasExtras",ponto.datasExtras());memoria.put("formulaHorasExtras","(salario / carga mensal) x 1,5 x horas extras");memoria.put("valorHorasExtras",extras);memoria.put("datasFalta",datasFalta);memoria.put("diasAbonados",abonados.stream().sorted().toList());memoria.put("valorFaltas",faltas);memoria.put("bruto",bruto);memoria.put("inss",inss);memoria.put("irrf",irrf);memoria.put("valeTransporte",transporte);memoria.put("liquido",item.getLiquido());item.setMemoriaCalculo(json.writeValueAsString(memoria));return item;
 }
}
