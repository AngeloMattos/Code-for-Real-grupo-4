package br.com.folhaconecta.usuario;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.empresa.Empresa;
import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.shared.entity.EntidadeBase;

@Entity
@Table(name = "usuario")
@Getter
@Setter
public class Usuario extends EntidadeBase {

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(unique = true, length = 150)
    private String email;                 // login de quem e da empresa (RH, Financeiro...)

    @Column(unique = true, length = 11)
    private String cpf;                   // login do funcionario, somente digitos

    private String senhaHash;             // vazio ate o primeiro acesso

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoLogin tipoLogin;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usuario_papel", joinColumns = @JoinColumn(name = "usuario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "papel", nullable = false, length = 20)
    private Set<Papel> papeis = new HashSet<>();

    // N:N porque a Contabilidade atende varias empresas
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "usuario_empresa",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "empresa_id"))
    private Set<Empresa> empresas = new HashSet<>();

    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY)
    private Funcionario funcionario;

    @Column(nullable = false)
    private boolean ativo = true;

    public Long getFuncionarioId() {
        return funcionario == null ? null : funcionario.getId();
    }
}
