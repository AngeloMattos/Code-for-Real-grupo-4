package br.com.folhaconecta.folha;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface ItemFolhaRepository extends JpaRepository<ItemFolha,Long> {
 List<ItemFolha> findByFolhaIdAndEmpresaId(Long folhaId,Long empresaId);
 Optional<ItemFolha> findByIdAndEmpresaId(Long id,Long empresaId);
 List<ItemFolha> findByFuncionarioIdAndEmpresaIdAndPublicadoTrueOrderByCriadoEmDesc(Long funcionarioId,Long empresaId);
}
