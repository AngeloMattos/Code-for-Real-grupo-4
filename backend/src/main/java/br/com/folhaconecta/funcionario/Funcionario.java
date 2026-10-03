package br.com.folhaconecta.funcionario;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.empresa.Empresa;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.usuario.Usuario;

@Entity
@Table(name = "funcionario")
@Getter
@Setter
public class Funcionario extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Empresa empresa;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;              // vazio ate o primeiro acesso

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 11)
    private String cpf;                   // somente digitos

    @Column(length = 30)
    private String matricula;

    @Column(length = 80)
    private String cargo;

    @Column(length = 80)
    private String departamento;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salarioBase;

    @Column(nullable = false)
    private int cargaHorariaMensal = 220;

    private LocalDate dataAdmissao;

    @Column(nullable = false)
    private boolean ativo = true;
}
