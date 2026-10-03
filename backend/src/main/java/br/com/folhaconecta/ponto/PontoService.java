package br.com.folhaconecta.ponto;
import br.com.folhaconecta.ponto.dto.*; import br.com.folhaconecta.auth.*; import br.com.folhaconecta.usuario.*; import br.com.folhaconecta.funcionario.*;
import br.com.folhaconecta.shared.*; import br.com.folhaconecta.shared.exception.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.*; import java.math.*; import java.util.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class PontoService {
 private final RegistroPontoRepository registros; private final RegistroPontoEventoRepository eventos; private final FuncionarioRepository funcionarios; private final UsuarioLogado logado; private final Relogio relogio;
 public record TotalResponse(Long funcionarioId,String funcionarioNome,BigDecimal totalHoras,BigDecimal horasExtras,int diasIncompletos){}
 public record EventoPontoResponse(String autor,LocalTime entradaAnterior,LocalTime saidaAnterior,LocalTime entradaNova,LocalTime saidaNova,String justificativa,LocalDateTime criadoEm){}
 @Transactional public PontoResponse registrar(){
  logado.exigir(Papel.FUNCIONARIO);var funcionario=funcionarios.bloquear(logado.funcionarioId(),logado.empresaId()).orElseThrow(NaoEncontradoException::new);
  var registro=registros.findByEmpresaIdAndFuncionarioIdAndData(logado.empresaId(),funcionario.getId(),relogio.hoje()).orElseGet(()->{var novo=new RegistroPonto();novo.setEmpresa(logado.empresa());novo.setFuncionario(funcionario);novo.setData(relogio.hoje());return novo;});
  if(registro.getSaida()!=null)throw new RegraNegocioException("A jornada de hoje ja foi encerrada.");
  var entradaAnterior=registro.getEntrada();if(registro.getEntrada()==null)registro.setEntrada(LocalTime.now().withNano(0));else registro.setSaida(LocalTime.now().withNano(0));registros.save(registro);gravar(registro,entradaAnterior,null,"Marcacao registrada pelo funcionario.");return resumir(registro);
 }
 @Transactional(readOnly=true) public List<PontoResponse> meusRegistros(String competencia){logado.exigir(Papel.FUNCIONARIO);var mes=YearMonth.parse(competencia);return registros.findByEmpresaIdAndFuncionarioIdAndDataBetweenOrderByDataAsc(logado.empresaId(),logado.funcionarioId(),mes.atDay(1),mes.atEndOfMonth()).stream().map(this::resumir).toList();}
 @Transactional(readOnly=true) public List<?> equipe(String competencia,boolean inconsistentes){
  logado.exigir(Papel.RH,Papel.FINANCEIRO);var mes=YearMonth.parse(competencia);var lista=registros.findByEmpresaIdAndDataBetweenOrderByDataDesc(logado.empresaId(),mes.atDay(1),mes.atEndOfMonth());
  if(logado.tem(Papel.FINANCEIRO)&&!logado.tem(Papel.RH))return funcionarios.findByEmpresaId(logado.empresaId()).stream().map(f->{var pessoa=lista.stream().filter(p->p.getFuncionario().getId().equals(f.getId())).map(this::resumir).toList();return new TotalResponse(f.getId(),f.getNome(),pessoa.stream().map(PontoResponse::totalHoras).reduce(BigDecimal.ZERO,BigDecimal::add),pessoa.stream().map(PontoResponse::horasExtras).reduce(BigDecimal.ZERO,BigDecimal::add),(int)pessoa.stream().filter(PontoResponse::inconsistente).count());}).toList();
  var resposta=new ArrayList<PontoResponse>();for(var funcionario:funcionarios.findByEmpresaId(logado.empresaId())){
   var porData=new HashMap<LocalDate,RegistroPonto>();lista.stream().filter(p->p.getFuncionario().getId().equals(funcionario.getId())).forEach(p->porData.put(p.getData(),p));
   var limite=mes.atEndOfMonth().isBefore(relogio.hoje())?mes.atEndOfMonth():relogio.hoje();for(var data=mes.atDay(1);!data.isAfter(limite);data=data.plusDays(1))if(data.getDayOfWeek()!=DayOfWeek.SATURDAY&&data.getDayOfWeek()!=DayOfWeek.SUNDAY&&!data.isBefore(funcionario.getDataAdmissao())){
    var registro=porData.get(data);var linha=registro==null?new PontoResponse(null,funcionario.getId(),funcionario.getNome(),data,null,null,BigDecimal.ZERO,BigDecimal.ZERO,true,false,null):resumir(registro);if(!inconsistentes||linha.inconsistente())resposta.add(linha);
   }
  }resposta.sort(Comparator.comparing(PontoResponse::data).reversed().thenComparing(PontoResponse::funcionarioNome));return resposta;
 }
 @Transactional public PontoResponse ajustar(Long id,AjustarPontoRequest entrada){logado.exigir(Papel.RH);if(!entrada.saida().isAfter(entrada.entrada()))throw new RegraNegocioException("Saida deve ser posterior a entrada.");var registro=registros.findByIdAndEmpresaId(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);var anterior=registro.getEntrada();var saida=registro.getSaida();registro.setEntrada(entrada.entrada());registro.setSaida(entrada.saida());registro.setAjustado(true);registro.setJustificativa(entrada.justificativa());registro.setAjustadoPor(logado.usuario());gravar(registro,anterior,saida,entrada.justificativa());return resumir(registro);}
 @Transactional(readOnly=true) public List<EventoPontoResponse> historico(Long id){var registro=registros.findByIdAndEmpresaId(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);logado.conferirDono(registro.getFuncionario().getId());logado.exigir(Papel.RH,Papel.FUNCIONARIO);return eventos.findByRegistroIdAndEmpresaIdOrderByCriadoEmAsc(id,logado.empresaId()).stream().map(e->new EventoPontoResponse(e.getAutor().getNome(),e.getEntradaAnterior(),e.getSaidaAnterior(),e.getEntradaNova(),e.getSaidaNova(),e.getJustificativa(),e.getCriadoEm())).toList();}
 private void gravar(RegistroPonto registro,LocalTime entrada,LocalTime saida,String justificativa){var evento=new RegistroPontoEvento();evento.setEmpresa(registro.getEmpresa());evento.setRegistro(registro);evento.setAutor(logado.usuario());evento.setEntradaAnterior(entrada);evento.setSaidaAnterior(saida);evento.setEntradaNova(registro.getEntrada());evento.setSaidaNova(registro.getSaida());evento.setJustificativa(justificativa);eventos.save(evento);}
 private PontoResponse resumir(RegistroPonto registro){var total=horas(registro);return new PontoResponse(registro.getId(),registro.getFuncionario().getId(),registro.getFuncionario().getNome(),registro.getData(),registro.getEntrada(),registro.getSaida(),total,total.subtract(new BigDecimal("8")).max(BigDecimal.ZERO),registro.getEntrada()==null||registro.getSaida()==null,registro.isAjustado(),registro.getJustificativa());}
 public static BigDecimal horas(RegistroPonto registro){return registro.getEntrada()==null||registro.getSaida()==null?BigDecimal.ZERO:BigDecimal.valueOf(Math.max(0,Duration.between(registro.getEntrada(),registro.getSaida()).getSeconds())).divide(new BigDecimal("3600"),2,RoundingMode.HALF_EVEN);}
 @Transactional(readOnly=true) public ResumoPonto resumo(Funcionario funcionario,String competencia){
  var mes=YearMonth.parse(competencia);var lista=registros.findByEmpresaIdAndFuncionarioIdAndDataBetweenOrderByDataAsc(funcionario.getEmpresa().getId(),funcionario.getId(),mes.atDay(1),mes.atEndOfMonth());var extras=BigDecimal.ZERO;var datasExtras=new ArrayList<LocalDate>();var marcados=new HashSet<LocalDate>();
  for(var registro:lista){if(registro.getEntrada()!=null)marcados.add(registro.getData());var adicional=horas(registro).subtract(new BigDecimal("8")).max(BigDecimal.ZERO);extras=extras.add(adicional);if(adicional.signum()>0)datasExtras.add(registro.getData());}
  var faltas=new ArrayList<LocalDate>();var limite=mes.atEndOfMonth().isBefore(relogio.hoje())?mes.atEndOfMonth():relogio.hoje().minusDays(1);
  for(var data=mes.atDay(1);!data.isAfter(limite);data=data.plusDays(1))if(data.getDayOfWeek()!=DayOfWeek.SATURDAY&&data.getDayOfWeek()!=DayOfWeek.SUNDAY&&!data.isBefore(funcionario.getDataAdmissao())&&!marcados.contains(data))faltas.add(data);
  return new ResumoPonto(extras,faltas.size(),faltas,datasExtras);
 }
}
