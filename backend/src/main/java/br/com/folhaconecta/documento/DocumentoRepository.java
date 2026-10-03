package br.com.folhaconecta.documento;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface DocumentoRepository extends JpaRepository<Documento,Long> {
 List<Documento> findByPendenciaIdAndEmpresaId(Long pendenciaId,Long empresaId);
 Optional<Documento> findByIdAndEmpresaId(Long id,Long empresaId);
}
