package br.com.folhaconecta.auth.dto;

import java.util.List;

import br.com.folhaconecta.empresa.Empresa;
import br.com.folhaconecta.empresa.dto.EmpresaResumoResponse;
import br.com.folhaconecta.usuario.Papel;
import br.com.folhaconecta.usuario.TipoLogin;
import br.com.folhaconecta.usuario.Usuario;

public record UsuarioLogadoResponse(
    Long id,
    String nome,
    TipoLogin tipoLogin,
    List<Papel> papeis,
    EmpresaResumoResponse empresa,
    Long funcionarioId) {

    public static UsuarioLogadoResponse de(Usuario u, Empresa empresaAtiva) {
        return new UsuarioLogadoResponse(
            u.getId(),
            u.getNome(),
            u.getTipoLogin(),
            u.getPapeis().stream().sorted().toList(),
            EmpresaResumoResponse.de(empresaAtiva),
            u.getFuncionarioId());
    }
}
