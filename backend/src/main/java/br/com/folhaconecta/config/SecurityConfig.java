package br.com.folhaconecta.config;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import javax.crypto.SecretKey; import javax.crypto.spec.SecretKeySpec; import java.nio.charset.StandardCharsets;
import org.springframework.context.annotation.*; import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm; import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.*; import org.springframework.security.web.SecurityFilterChain;
import lombok.RequiredArgsConstructor;
@Configuration @EnableMethodSecurity @RequiredArgsConstructor
public class SecurityConfig {
 private final JwtProperties propriedades;
 @Bean SecurityFilterChain configurar(HttpSecurity http) throws Exception {
  var papeis=new JwtGrantedAuthoritiesConverter(); papeis.setAuthoritiesClaimName("papeis"); papeis.setAuthorityPrefix("ROLE_");
  var conversor=new JwtAuthenticationConverter(); conversor.setJwtGrantedAuthoritiesConverter(papeis);
  return http.csrf(c->c.disable()).cors(Customizer.withDefaults())
   .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers("/api/auth/login","/api/auth/refresh","/api/auth/logout","/api/auth/primeiro-acesso","/api/auth/esqueci-senha","/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**").permitAll().requestMatchers("/api/admin/**").hasRole("ADMIN").anyRequest().authenticated())
   .oauth2ResourceServer(o->o.jwt(j->j.jwtAuthenticationConverter(conversor))
    .authenticationEntryPoint((q,r,e)->{r.setStatus(401);r.setContentType("application/json");r.getWriter().write("{\"status\":401,\"erro\":\"NAO_AUTENTICADO\",\"mensagem\":\"Sessao expirada. Entre novamente.\",\"campos\":{}}");})
    .accessDeniedHandler((q,r,e)->{r.setStatus(403);r.setContentType("application/json");r.getWriter().write("{\"status\":403,\"erro\":\"ACESSO_NEGADO\",\"mensagem\":\"Voce nao tem permissao para esta acao.\",\"campos\":{}}");}))
   .exceptionHandling(e->e.accessDeniedHandler((q,r,x)->{r.setStatus(403);r.setContentType("application/json");r.getWriter().write("{\"status\":403,\"erro\":\"ACESSO_NEGADO\",\"mensagem\":\"Voce nao tem permissao para esta acao.\",\"campos\":{}}");})).build();
 }
 private SecretKey chave(){return new SecretKeySpec(propriedades.secret().getBytes(StandardCharsets.UTF_8),"HmacSHA256");}
 @Bean JwtDecoder decodificador(){return NimbusJwtDecoder.withSecretKey(chave()).macAlgorithm(MacAlgorithm.HS256).build();}
 @Bean JwtEncoder codificador(){return new NimbusJwtEncoder(new ImmutableSecret<>(chave()));}
 @Bean PasswordEncoder senhas(){return new BCryptPasswordEncoder();}
}
