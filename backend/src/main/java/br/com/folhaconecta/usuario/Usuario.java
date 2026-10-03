package br.com.folhaconecta.usuario;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="usuario") @Getter @Setter
public class Usuario extends EntidadeBase {
  private String nome;
  private String email;
  private String cpf;
  private String senhaHash;
 @Enumerated(EnumType.STRING) private TipoLogin tipoLogin;
  private boolean ativo;
  private String conviteHash;
  private LocalDateTime conviteExpiraEm;
 @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="usuario_papel",joinColumns=@JoinColumn(name="usuario_id")) @Enumerated(EnumType.STRING) @Column(name="papel") private Set<Papel> papeis=new HashSet<>();
 @ManyToMany(fetch=FetchType.EAGER) @JoinTable(name="usuario_empresa",joinColumns=@JoinColumn(name="usuario_id"),inverseJoinColumns=@JoinColumn(name="empresa_id")) private Set<Empresa> empresas=new HashSet<>();
}
