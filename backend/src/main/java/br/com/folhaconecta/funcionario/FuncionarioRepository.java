package br.com.folhaconecta.funcionario;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface FuncionarioRepository extends JpaRepository<Funcionario,Long> {
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @Query("select f from Funcionario f where f.id=:id and f.empresa.id=:empresaId") Optional<Funcionario> bloquear(@Param("id") Long id,@Param("empresaId") Long empresaId);
 List<Funcionario> findByEmpresaId(Long empresaId);
 Optional<Funcionario> findByIdAndEmpresaId(Long id,Long empresaId);
 Optional<Funcionario> findByUsuarioIdAndEmpresaId(Long usuarioId,Long empresaId);
}
