package br.com.folhaconecta.usuario;
import br.com.folhaconecta.auth.*; import br.com.folhaconecta.shared.exception.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.constraints.*; import java.util.*; import java.time.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class UsuarioService {
 private final UsuarioRepository usuarios; private final UsuarioLogado logado; private final PasswordEncoder senhas; private final TokenService tokens;
 public record UsuarioRequest(@NotBlank String nome,@Email String email,@NotEmpty Set<Papel> papeis,boolean ativo,@Size(min=8,max=72) String senha){}
 public record UsuarioResponse(Long id,String nome,String email,String cpf,Set<Papel> papeis,boolean ativo){}
 public record ConviteResponse(String convite){}
 private UsuarioResponse resumir(Usuario usuario){return new UsuarioResponse(usuario.getId(),usuario.getNome(),usuario.getEmail(),usuario.getCpf(),usuario.getPapeis(),usuario.isAtivo());}
 @Transactional(readOnly=true) public List<UsuarioResponse> listar(){return usuarios.daEmpresa(logado.empresaId()).stream().map(this::resumir).toList();}
 @Transactional public UsuarioResponse criar(UsuarioRequest entrada){logado.exigir(Papel.ADMIN);if(entrada.papeis().contains(Papel.FUNCIONARIO))throw new RegraNegocioException("Cadastre funcionarios na tela de Funcionarios.");if(entrada.email()==null||entrada.email().isBlank())throw new RegraNegocioException("Informe um email corporativo.");var usuario=new Usuario();usuario.setTipoLogin(TipoLogin.EMPRESA);usuario.setEmpresas(Set.of(logado.empresa()));preencher(usuario,entrada);return resumir(usuarios.save(usuario));}
 @Transactional public UsuarioResponse editar(Long id,UsuarioRequest entrada){logado.exigir(Papel.ADMIN);var usuario=usuarios.daEmpresaPorId(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);if(usuario.getId().equals(logado.id())&&(!entrada.ativo()||!entrada.papeis().contains(Papel.ADMIN)))throw new RegraNegocioException("Seu proprio acesso de Admin deve ser mantido.");if(usuario.getTipoLogin()==TipoLogin.FUNCIONARIO&&!entrada.papeis().equals(Set.of(Papel.FUNCIONARIO))||usuario.getTipoLogin()==TipoLogin.EMPRESA&&entrada.papeis().contains(Papel.FUNCIONARIO))throw new RegraNegocioException("Os papeis devem corresponder ao tipo de login.");preencher(usuario,entrada);return resumir(usuario);}
 private void preencher(Usuario usuario,UsuarioRequest entrada){usuario.setNome(entrada.nome());usuario.setEmail(entrada.email());usuario.setPapeis(new HashSet<>(entrada.papeis()));usuario.setAtivo(entrada.ativo());if(entrada.senha()!=null)usuario.setSenhaHash(senhas.encode(entrada.senha()));}
 @Transactional public ConviteResponse redefinir(Long id){logado.exigir(Papel.ADMIN,Papel.RH);var usuario=usuarios.daEmpresaPorId(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);if(logado.tem(Papel.RH)&&!usuario.getPapeis().equals(Set.of(Papel.FUNCIONARIO)))throw new AcessoNegadoException();String bruto=tokens.gerarAleatorio();usuario.setConviteHash(tokens.hash(bruto));usuario.setConviteExpiraEm(LocalDateTime.now().plusHours(48));return new ConviteResponse("/primeiro-acesso?token="+bruto);}
}
