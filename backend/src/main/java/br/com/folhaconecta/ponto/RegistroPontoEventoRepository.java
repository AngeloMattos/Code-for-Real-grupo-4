package br.com.folhaconecta.ponto;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface RegistroPontoEventoRepository extends JpaRepository<RegistroPontoEvento,Long>{List<RegistroPontoEvento> findByRegistroIdAndEmpresaIdOrderByCriadoEmAsc(Long registroId,Long empresaId);}
