package br.com.folhaconecta.pendencia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.usuario.Usuario;

@Entity
@Table(name = "pendencia_evento")
@Getter
@Setter
public class PendenciaEvento extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Pendencia pendencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Usuario autor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoEvento tipo;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private StatusPendencia statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private StatusPendencia statusNovo;

    @Column(columnDefinition = "text")
    private String comentario;
}
