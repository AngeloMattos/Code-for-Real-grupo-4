package br.com.folhaconecta.shared.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;
@MappedSuperclass @Getter @Setter @EntityListeners(org.springframework.data.jpa.domain.support.AuditingEntityListener.class)
public abstract class EntidadeBase {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @org.springframework.data.annotation.CreatedDate @Column(nullable=false) private LocalDateTime criadoEm;
 @org.springframework.data.annotation.LastModifiedDate @Column(nullable=false) private LocalDateTime atualizadoEm;
 @PrePersist protected void iniciar() { if(criadoEm==null) criadoEm=LocalDateTime.now(); if(atualizadoEm==null) atualizadoEm=criadoEm; }
 @PreUpdate protected void atualizar() { if(atualizadoEm==null) atualizadoEm=LocalDateTime.now(); }
}
