package br.com.folhaconecta.notificacao;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface NotificacaoRepository extends JpaRepository<Notificacao,Long> {
 List<Notificacao> findByUsuarioIdAndEmpresaIdOrderByCriadoEmDesc(Long usuarioId,Long empresaId);
 Optional<Notificacao> findByIdAndUsuarioIdAndEmpresaId(Long id,Long usuarioId,Long empresaId);
}
