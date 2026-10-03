package br.com.folhaconecta.shared.exception;

/** Regra de negocio violada. Vira 409. */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
