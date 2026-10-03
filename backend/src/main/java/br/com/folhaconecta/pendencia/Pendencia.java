package br.com.folhaconecta.pendencia;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.empresa.Empresa;
import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.usuario.Papel;
import br.com.folhaconecta.usuario.Usuario;

@Entity
@Table(name = "pendencia")
@Getter
@Setter
public class Pendencia extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Funcionario funcionario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Usuario criadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    private Usuario responsavel;          // pessoa, opcional

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(columnDefinition = "text")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoPendencia tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusPendencia status = StatusPendencia.ABERTA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel setorResponsavel;       // "com quem esta"

    private LocalDate prazo;

    @Column(length = 7)
    private String competencia;           // "2026-10"

    private LocalDate dataInicio;         // atestado e ferias
    private LocalDate dataFim;

    @Column(nullable = false)
    private boolean bloqueiaFolha;

    public boolean isAtrasada() {
        return status != StatusPendencia.CONCLUIDA
            && prazo != null && prazo.isBefore(LocalDate.now());
    }
}
