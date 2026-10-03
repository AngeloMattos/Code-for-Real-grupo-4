package br.com.folhaconecta.folha;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface FolhaRepository extends JpaRepository<Folha,Long> {
 Optional<Folha> findByEmpresaIdAndCompetencia(Long empresaId,String competencia);
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @Query("select f from Folha f where f.empresa.id=:empresaId and f.competencia=:competencia") Optional<Folha> bloquear(@Param("empresaId") Long empresaId,@Param("competencia") String competencia);
}
