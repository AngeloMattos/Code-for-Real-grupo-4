package br.com.folhaconecta.shared.web;

import java.util.Map;

public record ErroResponse(int status, String erro, String mensagem, Map<String, String> campos) {

    public static ErroResponse de(int status, String erro, String mensagem) {
        return new ErroResponse(status, erro, mensagem, Map.of());
    }
}
