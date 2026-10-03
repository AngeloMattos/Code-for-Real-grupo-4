package br.com.folhaconecta.shared.exception;
import br.com.folhaconecta.shared.web.ErroResponse; import java.util.*;
import org.springframework.web.bind.annotation.*; import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException; import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.converter.HttpMessageNotReadableException; import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.dao.DataIntegrityViolationException;
@RestControllerAdvice
public class GlobalExceptionHandler {
 private ResponseEntity<ErroResponse> resposta(int status,String codigo,String mensagem){return ResponseEntity.status(status).body(new ErroResponse(status,codigo,mensagem,Map.of(),List.of()));}
 @ExceptionHandler(NaoEncontradoException.class) ResponseEntity<ErroResponse> ausente(NaoEncontradoException erro){return resposta(404,"NAO_ENCONTRADO",erro.getMessage());}
 @ExceptionHandler({AcessoNegadoException.class,AccessDeniedException.class}) ResponseEntity<ErroResponse> negado(Exception erro){return resposta(403,"ACESSO_NEGADO","Voce nao tem permissao para esta acao.");}
 @ExceptionHandler(BadCredentialsException.class) ResponseEntity<ErroResponse> login(Exception erro){return resposta(401,"NAO_AUTENTICADO","Login ou senha invalidos");}
 @ExceptionHandler(RegraNegocioException.class) ResponseEntity<ErroResponse> negocio(RegraNegocioException erro){return ResponseEntity.status(409).body(new ErroResponse(409,"REGRA_NEGOCIO",erro.getMessage(),Map.of(),erro.bloqueios()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ErroResponse> validar(MethodArgumentNotValidException erro){var campos=new LinkedHashMap<String,String>(); erro.getBindingResult().getFieldErrors().forEach(e->campos.put(e.getField(),e.getDefaultMessage()));return ResponseEntity.badRequest().body(new ErroResponse(400,"VALIDACAO","Confira os campos informados.",campos,List.of()));}
 @ExceptionHandler({IllegalArgumentException.class,HttpMessageNotReadableException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class}) ResponseEntity<ErroResponse> invalido(Exception erro){return resposta(400,"VALIDACAO","Dados invalidos. Confira os campos informados.");}
 @ExceptionHandler(MaxUploadSizeExceededException.class) ResponseEntity<ErroResponse> tamanho(Exception erro){return resposta(400,"ARQUIVO_INVALIDO","Arquivo deve ter ate 5 MB.");}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<ErroResponse> duplicado(Exception erro){return resposta(409,"REGRA_NEGOCIO","Registro duplicado ou associado a outros dados.");}
}
