package br.com.folhaconecta.shared.exception;

/** Registro inexistente ou de outra empresa. Vira 404. */
public class NaoEncontradoException extends RuntimeException {

    public NaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
