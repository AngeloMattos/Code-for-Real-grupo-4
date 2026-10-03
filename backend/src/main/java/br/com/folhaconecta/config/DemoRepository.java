package br.com.folhaconecta.config;
import org.springframework.context.annotation.Profile; import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.JdbcTemplate; import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator; import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.annotation.Transactional; import lombok.RequiredArgsConstructor;
@Repository @Profile("dev") @RequiredArgsConstructor
public class DemoRepository {
 private final JdbcTemplate banco;
 @Transactional public void resetar(){banco.execute("truncate table registro_ponto_evento,notificacao,refresh_token,documento,pendencia_evento,item_folha,folha,registro_ponto,pendencia,funcionario,usuario_papel,usuario_empresa,usuario,empresa restart identity cascade");var dados=new ResourceDatabasePopulator(new ClassPathResource("db/migration/V2__dados_demo.sql"),new ClassPathResource("db/migration/V4__pendencias_apresentacao.sql"),new ClassPathResource("db/migration/V5__tipos_legados.sql"));dados.setSqlScriptEncoding("UTF-8");dados.execute(banco.getDataSource());banco.update("delete from registro_ponto where data=? and ajustado=false",java.sql.Date.valueOf("2026-10-20"));}
}
