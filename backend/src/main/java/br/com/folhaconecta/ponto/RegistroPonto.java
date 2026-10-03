package br.com.folhaconecta.ponto;

import java.time.LocalDate;
import java.time.LocalTime;

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
@Table(name = "registro_ponto")
@Getter
@Setter
public class RegistroPonto extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Funcionario funcionario;

    @Column(nullable = false)
    private LocalDate data;

    private LocalTime entrada;
    private LocalTime saida;

    @Column(nullable = false)
    private boolean ajustado;

    @Column(columnDefinition = "text")
    private String justificativa;
}
