package br.com.folhaconecta.ponto;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface RegistroPontoRepository extends JpaRepository<RegistroPonto,Long> {
 List<RegistroPonto> findByEmpresaIdAndDataBetweenOrderByDataDesc(Long empresaId,java.time.LocalDate inicio,java.time.LocalDate fim);
 Optional<RegistroPonto> findByIdAndEmpresaId(Long id,Long empresaId);
 Optional<RegistroPonto> findByEmpresaIdAndFuncionarioIdAndData(Long empresaId,Long funcionarioId,java.time.LocalDate data);
 List<RegistroPonto> findByEmpresaIdAndFuncionarioIdAndDataBetweenOrderByDataAsc(Long empresaId,Long funcionarioId,java.time.LocalDate inicio,java.time.LocalDate fim);
}
