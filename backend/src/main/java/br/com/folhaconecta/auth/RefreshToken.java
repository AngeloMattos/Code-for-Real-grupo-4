package br.com.folhaconecta.auth;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.empresa.Empresa;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.usuario.Usuario;

@Entity
@Table(name = "refresh_token")
@Getter
@Setter
public class RefreshToken extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Empresa empresa;              // empresa ativa quando o token foi emitido

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;             // SHA-256 em hex; o token puro nunca e salvo

    @Column(nullable = false)
    private LocalDateTime expiraEm;

    @Column(nullable = false)
    private boolean revogado;

    public boolean isValido() {
        return !revogado && expiraEm.isAfter(LocalDateTime.now());
    }
}
