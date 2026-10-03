package br.com.folhaconecta.pendencia;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="pendencia_evento") @Getter @Setter
public class PendenciaEvento extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY) private Pendencia pendencia;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario autor;
 @Enumerated(EnumType.STRING) private TipoEvento tipo;
 @Enumerated(EnumType.STRING) private StatusPendencia statusAnterior;
 @Enumerated(EnumType.STRING) private StatusPendencia statusNovo;
 @Column(columnDefinition="text") private String comentario;
}
