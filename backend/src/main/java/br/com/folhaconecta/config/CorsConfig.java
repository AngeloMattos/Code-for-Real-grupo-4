package br.com.folhaconecta.config;
import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.*;
import org.springframework.web.cors.*; import java.util.*;
@Configuration
public class CorsConfig {
 @Bean CorsConfigurationSource origens(@Value("${app.cors.origens}") String origens){
  var configuracao=new CorsConfiguration(); configuracao.setAllowedOrigins(Arrays.asList(origens.split(",")));
  configuracao.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
  configuracao.setAllowedHeaders(List.of("Authorization","Content-Type")); configuracao.setExposedHeaders(List.of("Content-Disposition")); configuracao.setAllowCredentials(true);
  var fonte=new UrlBasedCorsConfigurationSource(); fonte.registerCorsConfiguration("/**",configuracao); return fonte;
 }
}
