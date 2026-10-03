package br.com.folhaconecta.auth;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import br.com.folhaconecta.usuario.Papel;

/** Le do JWT da requisicao atual quem esta chamando. Todo service usa para filtrar por empresa. */
@Component
public class UsuarioLogado {

    private Jwt jwt() {
        return (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Long id() {
        return Long.valueOf(jwt().getSubject());
    }

    public Long empresaId() {
        return ((Number) jwt().getClaim("empresaId")).longValue();
    }

    public Long funcionarioId() {
        Number n = jwt().getClaim("funcionarioId");
        return n == null ? null : n.longValue();
    }

    public Set<Papel> papeis() {
        List<String> nomes = jwt().getClaimAsStringList("papeis");
        Set<Papel> papeis = EnumSet.noneOf(Papel.class);
        if (nomes != null) {
            nomes.forEach(n -> papeis.add(Papel.valueOf(n)));
        }
        return papeis;
    }

    public boolean tem(Papel p) {
        return papeis().contains(p);
    }
}
