from pathlib import Path
raiz=Path(__file__).resolve().parents[1]/'backend/src/main/java/br/com/folhaconecta'
repos={
 'empresa/Empresa': 'List<Empresa> findByIdIn(Collection<Long> ids);',
 'usuario/Usuario': '''Optional<Usuario> findByEmailIgnoreCaseAndTipoLogin(String email,br.com.folhaconecta.auth.TipoLogin tipoLogin);
 Optional<Usuario> findByCpfAndTipoLogin(String cpf,br.com.folhaconecta.auth.TipoLogin tipoLogin);
 Optional<Usuario> findByConviteHash(String conviteHash);
 @Query("select distinct u from Usuario u join u.empresas e where e.id=:empresaId") List<Usuario> daEmpresa(@Param("empresaId") Long empresaId);
 @Query("select distinct u from Usuario u join u.empresas e where e.id=:empresaId and u.id=:id") Optional<Usuario> daEmpresaPorId(@Param("id") Long id,@Param("empresaId") Long empresaId);''',
 'funcionario/Funcionario': '''List<Funcionario> findByEmpresaId(Long empresaId);
 Optional<Funcionario> findByIdAndEmpresaId(Long id,Long empresaId);
 Optional<Funcionario> findByUsuarioIdAndEmpresaId(Long usuarioId,Long empresaId);''',
 'pendencia/Pendencia': '''List<Pendencia> findByEmpresaId(Long empresaId);
 Optional<Pendencia> findByIdAndEmpresaId(Long id,Long empresaId);
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @Query("select p from Pendencia p where p.id=:id and p.empresa.id=:empresaId") Optional<Pendencia> bloquear(@Param("id") Long id,@Param("empresaId") Long empresaId);''',
 'pendencia/PendenciaEvento': 'List<PendenciaEvento> findByPendenciaIdAndEmpresaIdOrderByCriadoEmAsc(Long pendenciaId,Long empresaId);',
 'documento/Documento': '''List<Documento> findByPendenciaIdAndEmpresaId(Long pendenciaId,Long empresaId);
 Optional<Documento> findByIdAndEmpresaId(Long id,Long empresaId);''',
 'ponto/RegistroPonto': '''List<RegistroPonto> findByEmpresaIdAndDataBetweenOrderByDataDesc(Long empresaId,java.time.LocalDate inicio,java.time.LocalDate fim);
 Optional<RegistroPonto> findByIdAndEmpresaId(Long id,Long empresaId);
 Optional<RegistroPonto> findByEmpresaIdAndFuncionarioIdAndData(Long empresaId,Long funcionarioId,java.time.LocalDate data);
 List<RegistroPonto> findByEmpresaIdAndFuncionarioIdAndDataBetweenOrderByDataAsc(Long empresaId,Long funcionarioId,java.time.LocalDate inicio,java.time.LocalDate fim);''',
 'folha/Folha': '''Optional<Folha> findByEmpresaIdAndCompetencia(Long empresaId,String competencia);
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) @Query("select f from Folha f where f.empresa.id=:empresaId and f.competencia=:competencia") Optional<Folha> bloquear(@Param("empresaId") Long empresaId,@Param("competencia") String competencia);''',
 'folha/ItemFolha': '''List<ItemFolha> findByFolhaIdAndEmpresaId(Long folhaId,Long empresaId);
 Optional<ItemFolha> findByIdAndEmpresaId(Long id,Long empresaId);
 List<ItemFolha> findByFuncionarioIdAndEmpresaIdAndPublicadoTrueOrderByCriadoEmDesc(Long funcionarioId,Long empresaId);''',
 'notificacao/Notificacao': '''List<Notificacao> findByUsuarioIdAndEmpresaIdOrderByCriadoEmDesc(Long usuarioId,Long empresaId);
 Optional<Notificacao> findByIdAndUsuarioIdAndEmpresaId(Long id,Long usuarioId,Long empresaId);''',
 'auth/RefreshToken': '''@Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) Optional<RefreshToken> findByTokenHash(String tokenHash);''',
}
for caminho,metodos in repos.items():
 pacote,nome=caminho.split('/'); p=raiz/(caminho+'Repository.java'); p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(f'''package br.com.folhaconecta.{pacote};
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface {nome}Repository extends JpaRepository<{nome},Long>'''+(', JpaSpecificationExecutor<Pendencia>' if nome=='Pendencia' else '')+' {\n '+metodos+'\n}\n',encoding='utf-8')
