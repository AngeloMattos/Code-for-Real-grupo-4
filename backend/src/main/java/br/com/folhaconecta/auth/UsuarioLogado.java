package br.com.folhaconecta.auth;
import br.com.folhaconecta.usuario.*; import br.com.folhaconecta.empresa.*; import br.com.folhaconecta.shared.exception.*;
import org.springframework.stereotype.Component; import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt; import java.util.*; import lombok.RequiredArgsConstructor;
@Component @RequiredArgsConstructor
public class UsuarioLogado {
 private final UsuarioRepository usuarios; private final EmpresaRepository empresas;
 private Jwt jwt(){return (Jwt)SecurityContextHolder.getContext().getAuthentication().getPrincipal();}
 public Long id(){return Long.valueOf(jwt().getSubject());}
 public Long empresaId(){return ((Number)jwt().getClaim("empresaId")).longValue();}
 public Long funcionarioId(){Number numero=jwt().getClaim("funcionarioId");return numero==null?null:numero.longValue();}
 public Set<Papel> papeis(){var resultado=new HashSet<Papel>();jwt().getClaimAsStringList("papeis").forEach(p->resultado.add(Papel.valueOf(p)));return resultado;}
 public boolean tem(Papel papel){return papeis().contains(papel);}
 public Usuario usuario(){var usuario=usuarios.daEmpresaPorId(id(),empresaId()).orElseThrow(NaoEncontradoException::new);if(!usuario.isAtivo())throw new AcessoNegadoException();return usuario;}
 public Empresa empresa(){usuario();return empresas.findById(empresaId()).orElseThrow(NaoEncontradoException::new);}
 public void conferirDono(Long funcionario){if(tem(Papel.FUNCIONARIO)&&!Objects.equals(funcionarioId(),funcionario))throw new NaoEncontradoException();}
 public void exigir(Papel... permissoes){if(Arrays.stream(permissoes).noneMatch(this::tem))throw new AcessoNegadoException();}
}
