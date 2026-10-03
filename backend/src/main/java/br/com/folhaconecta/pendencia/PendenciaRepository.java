package br.com.folhaconecta.pendencia;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface PendenciaRepository extends JpaRepository<Pendencia,Long>, JpaSpecificationExecutor<Pendencia> {
 List<Pendencia> findByEmpresaId(Long empresaId);
 Optional<Pendencia> findByIdAndEmpresaId(Long id,Long empresaId);
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @Query("select p from Pendencia p where p.id=:id and p.empresa.id=:empresaId") Optional<Pendencia> bloquear(@Param("id") Long id,@Param("empresaId") Long empresaId);
}
