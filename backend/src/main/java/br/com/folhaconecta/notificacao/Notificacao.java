package br.com.folhaconecta.notificacao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.usuario.Usuario;

@Entity
@Table(name = "notificacao")
@Getter
@Setter
public class Notificacao extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "text")
    private String mensagem;

    @Column(length = 300)
    private String link;

    @Column(nullable = false)
    private boolean lida;
}
