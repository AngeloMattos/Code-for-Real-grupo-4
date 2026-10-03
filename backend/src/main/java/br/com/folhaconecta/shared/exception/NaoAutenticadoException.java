package br.com.folhaconecta.shared.exception;

/** Credenciais ou refresh token invalidos. Vira 401. */
public class NaoAutenticadoException extends RuntimeException {

    public NaoAutenticadoException(String mensagem) {
        super(mensagem);
    }
}
