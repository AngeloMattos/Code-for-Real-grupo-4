package br.com.folhaconecta.shared.exception;
import java.util.List;
public class RegraNegocioException extends RuntimeException {
 private final List<?> bloqueios;
 public RegraNegocioException(String mensagem){this(mensagem,List.of());}
 public RegraNegocioException(String mensagem,List<?> bloqueios){super(mensagem);this.bloqueios=bloqueios;}
 public List<?> bloqueios(){return bloqueios;}
}
