package br.com.folhaconecta;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
@SpringBootApplication @ConfigurationPropertiesScan
public class FolhaConectaApplication {
 public static void main(String[] argumentos) { SpringApplication.run(FolhaConectaApplication.class, argumentos); }
}
