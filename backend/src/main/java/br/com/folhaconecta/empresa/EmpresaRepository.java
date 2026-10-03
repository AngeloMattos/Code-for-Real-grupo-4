package br.com.folhaconecta.empresa;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface EmpresaRepository extends JpaRepository<Empresa,Long> {
 List<Empresa> findByIdIn(Collection<Long> ids);
}
