package br.com.folhaconecta.config;
import org.springframework.context.annotation.*; import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info; import io.swagger.v3.oas.models.security.*;
@Configuration
public class OpenApiConfig {
 @Bean OpenAPI contrato(){return new OpenAPI().info(new Info().title("Folha Conecta API").version("2.0").description("API multiempresa. Valores de folha sao previas simplificadas."))
  .components(new Components().addSecuritySchemes("jwt",new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
  .addSecurityItem(new SecurityRequirement().addList("jwt"));}
}
