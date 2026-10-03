package br.com.folhaconecta.folha;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.shared.entity.EntidadeBase;

@Entity
@Table(name = "item_folha")
@Getter
@Setter
public class ItemFolha extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Folha folha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Funcionario funcionario;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salarioBase;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal horasExtras;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorHorasExtras;

    @Column(nullable = false)
    private int diasFalta;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorFaltas;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal inss;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal irrf;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valeTransporte;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal liquido;

    @Column(columnDefinition = "text")
    private String memoriaCalculo;        // JSON com cada parcela do calculo

    @Column(nullable = false)
    private boolean publicado;            // vira o holerite quando publicado
}
