package br.com.folhaconecta.usuario;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
 Optional<Usuario> findByEmailIgnoreCaseAndTipoLogin(String email,br.com.folhaconecta.auth.TipoLogin tipoLogin);
 Optional<Usuario> findByCpfAndTipoLogin(String cpf,br.com.folhaconecta.auth.TipoLogin tipoLogin);
 Optional<Usuario> findByConviteHash(String conviteHash);
 @Query("select distinct u from Usuario u join u.empresas e where e.id=:empresaId") List<Usuario> daEmpresa(@Param("empresaId") Long empresaId);
 @Query("select distinct u from Usuario u join u.empresas e where e.id=:empresaId and u.id=:id") Optional<Usuario> daEmpresaPorId(@Param("id") Long id,@Param("empresaId") Long empresaId);
}
