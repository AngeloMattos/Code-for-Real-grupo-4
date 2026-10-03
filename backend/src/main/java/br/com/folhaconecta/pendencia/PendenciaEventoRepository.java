package br.com.folhaconecta.pendencia;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface PendenciaEventoRepository extends JpaRepository<PendenciaEvento,Long> {
 List<PendenciaEvento> findByPendenciaIdAndEmpresaIdOrderByCriadoEmAsc(Long pendenciaId,Long empresaId);
}
