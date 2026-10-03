package br.com.folhaconecta.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/** Copia apenas o documento ficticio reservado pelas migrations da demonstracao. */
@Component
@Profile("dev")
public class DemoArquivos implements ApplicationRunner {
 private final Path pasta;
 public DemoArquivos(@Value("${app.uploads.pasta}") String pasta){this.pasta=Path.of(pasta).toAbsolutePath().normalize();}
 @Override public void run(ApplicationArguments argumentos) throws Exception {
  for(var empresaId:List.of(1L,2L,3L,4L)){
   var diretorio=pasta.resolve(empresaId.toString());Files.createDirectories(diretorio);
   var arquivo=diretorio.resolve("atestado-demo.pdf");
   if(!Files.exists(arquivo))try(var entrada=new ClassPathResource("demo/atestado-demo.pdf").getInputStream()){Files.copy(entrada,arquivo);}
  }
 }
}
