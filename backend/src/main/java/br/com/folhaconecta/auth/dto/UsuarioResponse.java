package br.com.folhaconecta.auth.dto;
import br.com.folhaconecta.usuario.Papel; import java.util.*;
public record UsuarioResponse(Long id,String nome,Set<Papel> papeis,EmpresaResumo empresa,Long funcionarioId,List<EmpresaResumo> empresas){
 public record EmpresaResumo(Long id,String nome){}
}
