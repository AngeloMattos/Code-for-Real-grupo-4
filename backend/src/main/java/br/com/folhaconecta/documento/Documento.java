package br.com.folhaconecta.documento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.Pendencia;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.usuario.Usuario;

@Entity
@Table(name = "documento")
@Getter
@Setter
public class Documento extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Pendencia pendencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Funcionario funcionario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Usuario enviadoPor;

    @Column(nullable = false)
    private String nomeOriginal;

    @Column(nullable = false, length = 500)
    private String caminhoArquivo;        // relativo a uploads/{empresaId}/

    @Column(length = 100)
    private String contentType;

    @Column(nullable = false)
    private long tamanhoBytes;

    @Column(nullable = false)
    private boolean sensivel;             // atestado: so RH ou o dono pode baixar
}
