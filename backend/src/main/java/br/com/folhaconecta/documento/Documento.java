package br.com.folhaconecta.documento;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="documento") @Getter @Setter
public class Documento extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY) private Pendencia pendencia;
 @ManyToOne(fetch=FetchType.LAZY) private Funcionario funcionario;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario enviadoPor;
  private String nomeOriginal;
  private String caminhoArquivo;
  private String contentType;
  private long tamanhoBytes;
  private boolean sensivel;
}
