package br.com.folhaconecta.funcionario;
import br.com.folhaconecta.funcionario.dto.*; import br.com.folhaconecta.auth.*; import br.com.folhaconecta.usuario.*; import br.com.folhaconecta.shared.exception.*; import br.com.folhaconecta.shared.web.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import org.springframework.data.domain.*;
import java.time.*; import java.util.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class FuncionarioService {
 private final FuncionarioRepository funcionarios; private final UsuarioRepository usuarios; private final UsuarioLogado logado; private final TokenService tokens;
 public record CadastroResponse(FuncionarioResponse funcionario,String convite){}
 public Funcionario buscar(Long id){return funcionarios.findByIdAndEmpresaId(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);}
 private boolean salario(){return logado.tem(Papel.FINANCEIRO)||logado.tem(Papel.CONTABILIDADE)||logado.tem(Papel.FUNCIONARIO);}
 @Transactional(readOnly=true) public PaginaResponse<FuncionarioResponse> listar(String q,String departamento,Pageable pagina){var lista=funcionarios.findByEmpresaId(logado.empresaId()).stream().filter(f->q==null||f.getNome().toLowerCase().contains(q.toLowerCase())||f.getMatricula().contains(q)).filter(f->departamento==null||f.getDepartamento().equals(departamento)).map(f->FuncionarioResponse.de(f,salario())).toList();int inicio=Math.min((int)pagina.getOffset(),lista.size());return PaginaResponse.de(new PageImpl<>(lista.subList(inicio,Math.min(inicio+pagina.getPageSize(),lista.size())),pagina,lista.size()));}
 @Transactional(readOnly=true) public FuncionarioResponse detalhe(Long id){return FuncionarioResponse.de(buscar(id),salario());}
 @Transactional(readOnly=true) public FuncionarioResponse meusDados(){logado.exigir(Papel.FUNCIONARIO);return FuncionarioResponse.de(buscar(logado.funcionarioId()),true);}
 @Transactional public CadastroResponse criar(FuncionarioRequest entrada){
  logado.exigir(Papel.RH,Papel.ADMIN);var funcionario=new Funcionario();funcionario.setEmpresa(logado.empresa());preencher(funcionario,entrada);
  var usuario=new Usuario();usuario.setNome(entrada.nome());usuario.setCpf(entrada.cpf());usuario.setTipoLogin(TipoLogin.FUNCIONARIO);usuario.setAtivo(true);usuario.setPapeis(Set.of(Papel.FUNCIONARIO));usuario.setEmpresas(Set.of(logado.empresa()));
  String convite=tokens.gerarAleatorio();usuario.setConviteHash(tokens.hash(convite));usuario.setConviteExpiraEm(LocalDateTime.now().plusHours(48));usuarios.save(usuario);funcionario.setUsuario(usuario);funcionarios.save(funcionario);
  return new CadastroResponse(FuncionarioResponse.de(funcionario,false),"/primeiro-acesso?token="+convite);
 }
 @Transactional public FuncionarioResponse editar(Long id,EditarFuncionarioRequest entrada){logado.exigir(Papel.RH,Papel.ADMIN);var funcionario=buscar(id);preencher(funcionario,new FuncionarioRequest(entrada.nome(),entrada.cpf(),entrada.matricula(),entrada.cargo(),entrada.departamento(),entrada.salarioBase()==null?funcionario.getSalarioBase():entrada.salarioBase(),entrada.cargaHorariaMensal(),entrada.dataAdmissao(),entrada.ativo()));if(funcionario.getUsuario()!=null){funcionario.getUsuario().setNome(entrada.nome());funcionario.getUsuario().setCpf(entrada.cpf());}return FuncionarioResponse.de(funcionario,false);}
 private void preencher(Funcionario funcionario,FuncionarioRequest entrada){funcionario.setNome(entrada.nome());funcionario.setCpf(entrada.cpf());funcionario.setMatricula(entrada.matricula());funcionario.setCargo(entrada.cargo());funcionario.setDepartamento(entrada.departamento());funcionario.setSalarioBase(entrada.salarioBase().setScale(2,java.math.RoundingMode.HALF_EVEN));funcionario.setCargaHorariaMensal(entrada.cargaHorariaMensal());funcionario.setDataAdmissao(entrada.dataAdmissao());funcionario.setAtivo(entrada.ativo());}
}
