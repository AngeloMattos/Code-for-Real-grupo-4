package br.com.folhaconecta.folha;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.empresa.Empresa;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.usuario.Usuario;

@Entity
@Table(name = "folha",
    uniqueConstraints = @UniqueConstraint(columnNames = {"empresa_id", "competencia"}))
@Getter
@Setter
public class Folha extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Empresa empresa;

    @Column(nullable = false, length = 7)
    private String competencia;           // "2026-10"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusFolha status = StatusFolha.ABERTA;

    private LocalDateTime calculadaEm;
    private LocalDateTime fechadaEm;

    @ManyToOne(fetch = FetchType.LAZY)
    private Usuario fechadaPor;
}
