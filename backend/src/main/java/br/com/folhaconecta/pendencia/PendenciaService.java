package br.com.folhaconecta.pendencia;
import br.com.folhaconecta.pendencia.dto.*; import br.com.folhaconecta.usuario.*; import br.com.folhaconecta.auth.*;
import br.com.folhaconecta.funcionario.*; import br.com.folhaconecta.documento.*; import br.com.folhaconecta.notificacao.*;
import br.com.folhaconecta.shared.*; import br.com.folhaconecta.shared.exception.*; import br.com.folhaconecta.shared.web.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*; import org.springframework.data.jpa.domain.Specification; import org.springframework.web.multipart.MultipartFile;
import java.time.*; import java.util.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class PendenciaService {
 private final PendenciaRepository pendencias; private final PendenciaEventoRepository eventos; private final UsuarioLogado logado;
 private final FuncionarioRepository funcionarios; private final UsuarioRepository usuarios; private final NotificacaoService notificacoes;
 private final DocumentoRepository documentos; private final ArmazenamentoService armazenamento; private final Relogio relogio;
 public record PendenciaFiltro(StatusPendencia status,TipoPendencia tipo,Papel setor,Long funcionarioId,Boolean atrasadas,Boolean comigo,String q,String competencia,LocalDate de,LocalDate ate){}
 public record ComentarioRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=4000) String comentario){}
 public record AlterarPendenciaRequest(Long responsavelId,Papel setorResponsavel,LocalDate prazo){}
 private boolean visivel(Pendencia pendencia){
  if(logado.tem(Papel.FUNCIONARIO))return Objects.equals(pendencia.getFuncionario().getId(),logado.funcionarioId());
  if(logado.tem(Papel.RH)||logado.tem(Papel.ADMIN))return true;
  if(logado.tem(Papel.FINANCEIRO))return pendencia.isBloqueiaFolha()||pendencia.getSetorResponsavel()==Papel.FINANCEIRO;
  return logado.tem(Papel.CONTABILIDADE)&&(pendencia.getSetorResponsavel()==Papel.CONTABILIDADE||pendencia.getSetorSolicitante()==Papel.CONTABILIDADE);
 }
 public Pendencia buscar(Long id){var pendencia=pendencias.findByIdAndEmpresaId(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);if(!visivel(pendencia))throw new NaoEncontradoException();return pendencia;}
 private Pendencia bloquear(Long id){var pendencia=pendencias.bloquear(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);if(!visivel(pendencia))throw new NaoEncontradoException();return pendencia;}
 private Specification<Pendencia> escopo(){
  var especificacao=PendenciaSpecs.empresa(logado.empresaId());
  if(logado.tem(Papel.FUNCIONARIO))return especificacao.and(PendenciaSpecs.funcionario(logado.funcionarioId()));
  if(logado.tem(Papel.RH)||logado.tem(Papel.ADMIN))return especificacao;
  if(logado.tem(Papel.FINANCEIRO))return especificacao.and((r,q,c)->c.or(c.isTrue(r.get("bloqueiaFolha")),c.equal(r.get("setorResponsavel"),Papel.FINANCEIRO)));
  return especificacao.and((r,q,c)->c.or(c.equal(r.get("setorResponsavel"),Papel.CONTABILIDADE),c.equal(r.get("setorSolicitante"),Papel.CONTABILIDADE)));
 }
 @Transactional(readOnly=true) public PaginaResponse<PendenciaResponse> listar(PendenciaFiltro filtro,Pageable pagina){
  var especificacao=escopo();
  if(filtro.status()!=null)especificacao=especificacao.and(PendenciaSpecs.status(filtro.status()));if(filtro.tipo()!=null)especificacao=especificacao.and(PendenciaSpecs.tipo(filtro.tipo()));
  if(filtro.setor()!=null)especificacao=especificacao.and(PendenciaSpecs.setor(filtro.setor()));if(filtro.funcionarioId()!=null)especificacao=especificacao.and(PendenciaSpecs.funcionario(filtro.funcionarioId()));
  if(Boolean.TRUE.equals(filtro.atrasadas()))especificacao=especificacao.and(PendenciaSpecs.atrasadas(relogio.hoje()));if(Boolean.TRUE.equals(filtro.comigo()))especificacao=especificacao.and(PendenciaSpecs.setores(logado.papeis()));
  if(filtro.q()!=null&&!filtro.q().isBlank())especificacao=especificacao.and(PendenciaSpecs.busca(filtro.q()));
  if(filtro.competencia()!=null)especificacao=especificacao.and((r,q,c)->c.equal(r.get("competencia"),filtro.competencia()));
  if(filtro.de()!=null)especificacao=especificacao.and((r,q,c)->c.greaterThanOrEqualTo(r.get("prazo"),filtro.de()));if(filtro.ate()!=null)especificacao=especificacao.and((r,q,c)->c.lessThanOrEqualTo(r.get("prazo"),filtro.ate()));
  boolean ordemPadrao=pagina.getSort().isUnsorted()||pagina.getSort().stream().allMatch(o->o.getProperty().equals("prazo")&&o.isAscending());
  if(ordemPadrao){especificacao=especificacao.and((raiz,consulta,construtor)->{if(consulta!=null&&consulta.getResultType()!=Long.class){var atraso=construtor.and(construtor.lessThan(raiz.get("prazo"),relogio.hoje()),construtor.not(raiz.get("status").in(StatusPendencia.CONCLUIDA,StatusPendencia.CANCELADA)));consulta.orderBy(construtor.asc(construtor.<Integer>selectCase().when(atraso,0).otherwise(1)),construtor.asc(raiz.get("prazo")),construtor.asc(raiz.get("id")));}return construtor.conjunction();});pagina=PageRequest.of(pagina.getPageNumber(),pagina.getPageSize());}
  return PaginaResponse.de(pendencias.findAll(especificacao,pagina).map(this::resumir));
 }
 @Transactional(readOnly=true) public List<PendenciaResponse> todasVisiveis(){return pendencias.findAll(escopo(),Sort.by(Sort.Direction.ASC,"prazo")).stream().map(this::resumir).toList();}
 @Transactional(readOnly=true) public PendenciaResponse detalhe(Long id){return resumir(buscar(id));}
 @Transactional(readOnly=true) public List<EventoResponse> historico(Long id){buscar(id);return eventos.findByPendenciaIdAndEmpresaIdOrderByCriadoEmAsc(id,logado.empresaId()).stream().map(EventoResponse::de).toList();}
 public PendenciaResponse resumir(Pendencia pendencia){
  boolean permitido=logado.tem(Papel.RH)||logado.tem(Papel.FUNCIONARIO)&&Objects.equals(logado.funcionarioId(),pendencia.getFuncionario().getId());
  var arquivos=permitido?documentos.findByPendenciaIdAndEmpresaId(pendencia.getId(),logado.empresaId()).stream().map(d->new PendenciaResponse.DocumentoResumo(d.getId(),d.getNomeOriginal(),d.getContentType(),d.getTamanhoBytes(),d.isSensivel())).toList():List.<PendenciaResponse.DocumentoResumo>of();
  boolean atrasada=pendencia.getPrazo()!=null&&pendencia.getPrazo().isBefore(relogio.hoje())&&pendencia.getStatus()!=StatusPendencia.CONCLUIDA&&pendencia.getStatus()!=StatusPendencia.CANCELADA;
  return new PendenciaResponse(pendencia.getId(),pendencia.getTitulo(),pendencia.getDescricao(),pendencia.getTipo(),pendencia.getStatus(),pendencia.getSetorResponsavel(),pendencia.getResponsavel()==null?null:pendencia.getResponsavel().getNome(),pendencia.getFuncionario().getId(),pendencia.getFuncionario().getNome(),pendencia.getPrazo(),atrasada,pendencia.getCompetencia(),pendencia.isBloqueiaFolha(),pendencia.isAbonado(),pendencia.getDataInicio(),pendencia.getDataFim(),pendencia.getCriadoEm(),pendencia.getAtualizadoEm(),pendencia.getCriadoPor().getNome(),arquivos);
 }
 @Transactional public PendenciaResponse criar(CriarPendenciaRequest entrada){
  logado.exigir(Papel.RH,Papel.FINANCEIRO,Papel.CONTABILIDADE);if(entrada.setorResponsavel()==Papel.ADMIN)throw new RegraNegocioException("Admin tem acesso de leitura as pendencias.");
  var funcionario=funcionarios.findByIdAndEmpresaId(entrada.funcionarioId(),logado.empresaId()).orElseThrow(NaoEncontradoException::new);
  var pendencia=nova(funcionario,entrada.titulo(),entrada.descricao(),entrada.tipo(),entrada.setorResponsavel(),entrada.prazo(),entrada.competencia(),entrada.dataInicio(),entrada.dataFim(),entrada.bloqueiaFolha());return resumir(pendencia);
 }
 private Pendencia nova(Funcionario funcionario,String titulo,String descricao,TipoPendencia tipo,Papel setor,LocalDate prazo,String competencia,LocalDate inicio,LocalDate fim,boolean bloqueante){
  validarDatas(inicio,fim);var pendencia=new Pendencia();pendencia.setEmpresa(logado.empresa());pendencia.setFuncionario(funcionario);pendencia.setCriadoPor(logado.usuario());pendencia.setTitulo(titulo);pendencia.setDescricao(descricao);pendencia.setTipo(tipo);pendencia.setStatus(StatusPendencia.ABERTA);pendencia.setSetorResponsavel(setor);pendencia.setPrazo(prazo);pendencia.setCompetencia(competencia==null?YearMonth.from(inicio==null?relogio.hoje():inicio).toString():competencia);pendencia.setDataInicio(inicio);pendencia.setDataFim(fim);pendencia.setBloqueiaFolha(tipo==TipoPendencia.DUVIDA?false:bloqueante||Set.of(TipoPendencia.ATESTADO,TipoPendencia.FERIAS,TipoPendencia.AJUSTE_PONTO).contains(tipo));pendencias.save(pendencia);
  gravarEvento(pendencia,TipoEvento.CRIADA,null,"Solicitacao criada.");notificacoes.avisarSetor(pendencia.getEmpresa(),setor,pendencia);return pendencia;
 }
 private void validarDatas(LocalDate inicio,LocalDate fim){if((inicio==null)!=(fim==null)||inicio!=null&&fim.isBefore(inicio))throw new RegraNegocioException("Informe um periodo valido, com a data final igual ou posterior a inicial.");}
 @Transactional public PendenciaResponse solicitar(SolicitacaoRequest entrada,MultipartFile arquivo){
  logado.exigir(Papel.FUNCIONARIO);if(!Set.of(TipoPendencia.ATESTADO,TipoPendencia.FERIAS,TipoPendencia.ALTERACAO_CADASTRAL,TipoPendencia.DUVIDA).contains(entrada.tipo()))throw new RegraNegocioException("Tipo de solicitacao invalido.");
  if(entrada.tipo()==TipoPendencia.ATESTADO&&(arquivo==null||arquivo.isEmpty()||entrada.dataInicio()==null))throw new RegraNegocioException("Atestado exige arquivo e periodo de afastamento.");
  var funcionario=funcionarios.findByIdAndEmpresaId(logado.funcionarioId(),logado.empresaId()).orElseThrow(NaoEncontradoException::new);
  var prazo=relogio.hoje();for(int dias=0;dias<2;){prazo=prazo.plusDays(1);if(prazo.getDayOfWeek()!=DayOfWeek.SATURDAY&&prazo.getDayOfWeek()!=DayOfWeek.SUNDAY)dias++;}
  var pendencia=nova(funcionario,entrada.titulo(),entrada.observacao(),entrada.tipo(),Papel.RH,prazo,null,entrada.dataInicio(),entrada.dataFim(),false);if(arquivo!=null&&!arquivo.isEmpty()){armazenamento.salvar(pendencia,arquivo);gravarEvento(pendencia,TipoEvento.DOCUMENTO_ENVIADO,null,"Documento enviado ao RH.");}return resumir(pendencia);
 }
 @Transactional public PendenciaResponse mudarStatus(Long id,MudarStatusRequest entrada){
  if(logado.tem(Papel.ADMIN))throw new AcessoNegadoException();var pendencia=bloquear(id);TransicaoStatus.validar(pendencia,entrada,logado.papeis(),logado.id());var anterior=pendencia.getStatus();var setor=pendencia.getSetorResponsavel();
  if(entrada.novoStatus()==StatusPendencia.CORRECAO_SOLICITADA)pendencia.setSetorSolicitante(setor);
  if(anterior==StatusPendencia.EM_ANALISE&&entrada.novoStatus()==StatusPendencia.EM_ANALISE&&setor==Papel.RH&&(pendencia.getTipo()==TipoPendencia.ATESTADO||pendencia.getTipo()==TipoPendencia.FERIAS))pendencia.setAbonado(true);
  pendencia.setStatus(entrada.novoStatus());pendencia.setSetorResponsavel(entrada.proximoSetor());pendencia.setResponsavel(null);gravarEvento(pendencia,TipoEvento.STATUS_ALTERADO,anterior,entrada.comentario());if(setor!=entrada.proximoSetor())notificacoes.avisarSetor(pendencia.getEmpresa(),entrada.proximoSetor(),pendencia);return resumir(pendencia);
 }
 @Transactional public PendenciaResponse comentar(Long id,String comentario){if(logado.tem(Papel.ADMIN))throw new AcessoNegadoException();var pendencia=bloquear(id);gravarEvento(pendencia,TipoEvento.COMENTARIO,null,comentario);return resumir(pendencia);}
 @Transactional public PendenciaResponse atribuir(Long id,AlterarPendenciaRequest entrada){
  logado.exigir(Papel.RH);var pendencia=bloquear(id);if(pendencia.getStatus()==StatusPendencia.CONCLUIDA||pendencia.getStatus()==StatusPendencia.CANCELADA)throw new RegraNegocioException("Pendencia encerrada nao pode ser alterada.");
  if(entrada.setorResponsavel()!=null&&entrada.setorResponsavel()!=pendencia.getSetorResponsavel()){
   if(entrada.setorResponsavel()==Papel.ADMIN)throw new RegraNegocioException("Admin tem acesso de leitura.");pendencia.setSetorResponsavel(entrada.setorResponsavel());pendencia.setResponsavel(null);gravarEvento(pendencia,TipoEvento.ATRIBUIDA,null,"Encaminhada para "+entrada.setorResponsavel());notificacoes.avisarSetor(pendencia.getEmpresa(),entrada.setorResponsavel(),pendencia);
  }
  if(entrada.responsavelId()!=null){var usuario=usuarios.daEmpresaPorId(entrada.responsavelId(),logado.empresaId()).orElseThrow(NaoEncontradoException::new);if(!usuario.getPapeis().contains(pendencia.getSetorResponsavel()))throw new RegraNegocioException("Responsavel deve pertencer ao setor da pendencia.");pendencia.setResponsavel(usuario);gravarEvento(pendencia,TipoEvento.ATRIBUIDA,null,"Responsavel: "+usuario.getNome());}
  if(entrada.prazo()!=null){if(entrada.prazo().isBefore(relogio.hoje()))throw new RegraNegocioException("Prazo nao pode estar no passado.");pendencia.setPrazo(entrada.prazo());gravarEvento(pendencia,TipoEvento.PRAZO_ALTERADO,null,"Prazo atualizado para "+entrada.prazo());}return resumir(pendencia);
 }
 @Transactional public PendenciaResponse anexar(Long id,MultipartFile arquivo){
  logado.exigir(Papel.RH,Papel.FUNCIONARIO);var pendencia=bloquear(id);if(pendencia.getStatus()==StatusPendencia.CONCLUIDA||pendencia.getStatus()==StatusPendencia.CANCELADA)throw new RegraNegocioException("Solicitacao encerrada.");
  if(pendencia.getStatus()==StatusPendencia.CORRECAO_SOLICITADA)TransicaoStatus.validarReenvio(pendencia,logado.papeis());
  armazenamento.salvar(pendencia,arquivo);gravarEvento(pendencia,TipoEvento.DOCUMENTO_ENVIADO,null,"Documento enviado.");
  if(pendencia.getStatus()==StatusPendencia.CORRECAO_SOLICITADA){var anterior=pendencia.getStatus();pendencia.setStatus(StatusPendencia.EM_ANALISE);pendencia.setSetorResponsavel(pendencia.getSetorSolicitante());gravarEvento(pendencia,TipoEvento.STATUS_ALTERADO,anterior,"Correcao reenviada para analise.");notificacoes.avisarSetor(pendencia.getEmpresa(),pendencia.getSetorResponsavel(),pendencia);}return resumir(pendencia);
 }
 private void gravarEvento(Pendencia pendencia,TipoEvento tipo,StatusPendencia anterior,String comentario){var evento=new PendenciaEvento();evento.setEmpresa(pendencia.getEmpresa());evento.setPendencia(pendencia);evento.setAutor(logado.usuario());evento.setTipo(tipo);evento.setStatusAnterior(anterior);evento.setStatusNovo(pendencia.getStatus());evento.setComentario(comentario==null?"Status atualizado.":comentario);eventos.save(evento);pendencia.setAtualizadoEm(LocalDateTime.now());}
}
