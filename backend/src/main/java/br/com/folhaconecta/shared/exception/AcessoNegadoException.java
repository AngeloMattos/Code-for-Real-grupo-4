package br.com.folhaconecta.shared.exception;

/** Usuario autenticado sem permissao para a acao. Vira 403. */
public class AcessoNegadoException extends RuntimeException {

    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
