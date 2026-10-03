package br.com.folhaconecta.empresa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.shared.entity.EntidadeBase;

@Entity
@Table(name = "empresa")
@Getter
@Setter
public class Empresa extends EntidadeBase {

    @Column(nullable = false, length = 150)
    private String razaoSocial;

    @Column(length = 150)
    private String nomeFantasia;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;                  // somente digitos

    @Column(nullable = false)
    private int diaFechamento;            // dia do mes em que a folha fecha
}
