package br.com.folhaconecta.auth;
import br.com.folhaconecta.auth.dto.*; import br.com.folhaconecta.usuario.*; import br.com.folhaconecta.empresa.*;
import br.com.folhaconecta.funcionario.*; import br.com.folhaconecta.notificacao.*; import br.com.folhaconecta.pendencia.*;
import br.com.folhaconecta.config.JwtProperties; import br.com.folhaconecta.shared.exception.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.security.authentication.BadCredentialsException;
import java.time.*; import java.util.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class AuthService {
 private final UsuarioRepository usuarios; private final FuncionarioRepository funcionarios; private final RefreshTokenRepository refresh;
 private final TokenService tokens; private final JwtProperties propriedades; private final PasswordEncoder senhas; private final UsuarioLogado logado;
 private final PendenciaRepository pendencias; private final PendenciaEventoRepository eventos; private final NotificacaoService notificacoes;
 public record Sessao(LoginResponse resposta,String refreshToken){}
 @Transactional public Sessao entrar(LoginRequest entrada){
  var encontrado=entrada.tipo()==TipoLogin.FUNCIONARIO?usuarios.findByCpfAndTipoLogin(entrada.login().replaceAll("\\D",""),entrada.tipo()):usuarios.findByEmailIgnoreCaseAndTipoLogin(entrada.login().trim(),entrada.tipo());
  var usuario=encontrado.orElseThrow(()->new BadCredentialsException("Login ou senha invalidos"));
  if(!usuario.isAtivo()||usuario.getSenhaHash()==null||!senhas.matches(entrada.senha(),usuario.getSenhaHash())||usuario.getEmpresas().isEmpty())throw new BadCredentialsException("Login ou senha invalidos");
  return emitir(usuario,usuario.getEmpresas().stream().min(Comparator.comparing(Empresa::getId)).orElseThrow());
 }
 private Sessao emitir(Usuario usuario,Empresa empresa){
  String bruto=tokens.gerarAleatorio();var token=new RefreshToken();token.setUsuario(usuario);token.setEmpresa(empresa);token.setTokenHash(tokens.hash(bruto));token.setExpiraEm(LocalDateTime.now().plus(propriedades.refreshTtl()));refresh.save(token);
  return new Sessao(new LoginResponse(tokens.gerarAccessToken(usuario,empresa.getId()),Instant.now().plus(propriedades.accessTtl()),resumir(usuario,empresa)),bruto);
 }
 @Transactional public Sessao renovar(String bruto){
  if(bruto==null)throw new BadCredentialsException("Sessao expirada");var token=refresh.findByTokenHash(tokens.hash(bruto)).orElseThrow(()->new BadCredentialsException("Sessao expirada"));
  if(token.isRevogado()||token.getExpiraEm().isBefore(LocalDateTime.now())||!token.getUsuario().isAtivo()||token.getUsuario().getEmpresas().stream().noneMatch(e->e.getId().equals(token.getEmpresa().getId())))throw new BadCredentialsException("Sessao expirada");
  token.setRevogado(true);return emitir(token.getUsuario(),token.getEmpresa());
 }
 @Transactional public void sair(String bruto){if(bruto!=null)refresh.findByTokenHash(tokens.hash(bruto)).ifPresent(t->t.setRevogado(true));}
 @Transactional public Sessao trocarEmpresa(Long id,String bruto){
  logado.exigir(Papel.CONTABILIDADE);var usuario=logado.usuario();var empresa=usuario.getEmpresas().stream().filter(e->e.getId().equals(id)).findFirst().orElseThrow(NaoEncontradoException::new);sair(bruto);return emitir(usuario,empresa);
 }
 @Transactional(readOnly=true) public UsuarioResponse meusDados(){return resumir(logado.usuario(),logado.empresa());}
 private UsuarioResponse resumir(Usuario usuario,Empresa empresa){
  return new UsuarioResponse(usuario.getId(),usuario.getNome(),usuario.getPapeis(),new UsuarioResponse.EmpresaResumo(empresa.getId(),empresa.getNomeFantasia()),funcionarios.findByUsuarioIdAndEmpresaId(usuario.getId(),empresa.getId()).map(Funcionario::getId).orElse(null),usuario.getEmpresas().stream().sorted(Comparator.comparing(Empresa::getId)).map(e->new UsuarioResponse.EmpresaResumo(e.getId(),e.getNomeFantasia())).toList());
 }
 @Transactional public void primeiroAcesso(PrimeiroAcessoRequest entrada){
  var usuario=usuarios.findByConviteHash(tokens.hash(entrada.token())).orElseThrow(()->new RegraNegocioException("Convite invalido ou expirado."));
  if(usuario.getConviteExpiraEm()==null||usuario.getConviteExpiraEm().isBefore(LocalDateTime.now()))throw new RegraNegocioException("Convite invalido ou expirado.");
  usuario.setSenhaHash(senhas.encode(entrada.senha()));usuario.setConviteHash(null);usuario.setConviteExpiraEm(null);
 }
 @Transactional public void recuperar(String login){
  Optional<Usuario> encontrado=login.contains("@")?usuarios.findByEmailIgnoreCaseAndTipoLogin(login.trim(),TipoLogin.EMPRESA):usuarios.findByCpfAndTipoLogin(login.replaceAll("\\D",""),TipoLogin.FUNCIONARIO);
  encontrado.filter(Usuario::isAtivo).ifPresent(usuario->{for(var empresa:usuario.getEmpresas()){
   var funcionario=funcionarios.findByUsuarioIdAndEmpresaId(usuario.getId(),empresa.getId());
   if(funcionario.isPresent()){
    var pendencia=new Pendencia();pendencia.setEmpresa(empresa);pendencia.setFuncionario(funcionario.get());pendencia.setCriadoPor(usuario);pendencia.setTitulo("Solicitacao de redefinicao de senha");pendencia.setTipo(TipoPendencia.DUVIDA);pendencia.setStatus(StatusPendencia.ABERTA);pendencia.setSetorResponsavel(Papel.RH);pendencia.setCompetencia(YearMonth.now().toString());pendencia.setPrazo(LocalDate.now().plusDays(2));pendencias.save(pendencia);
    var evento=new PendenciaEvento();evento.setEmpresa(empresa);evento.setPendencia(pendencia);evento.setAutor(usuario);evento.setTipo(TipoEvento.CRIADA);evento.setStatusNovo(StatusPendencia.ABERTA);evento.setComentario("Pedido de recuperacao de acesso.");eventos.save(evento);notificacoes.avisarSetor(empresa,Papel.RH,pendencia);
   }else notificacoes.avisarRecuperacao(empresa,usuario);
  }});
 }
}
