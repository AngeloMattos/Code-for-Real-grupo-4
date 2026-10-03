package br.com.folhaconecta.empresa.dto;

import br.com.folhaconecta.empresa.Empresa;

public record EmpresaResumoResponse(Long id, String nome) {

    public static EmpresaResumoResponse de(Empresa e) {
        String nome = e.getNomeFantasia() != null ? e.getNomeFantasia() : e.getRazaoSocial();
        return new EmpresaResumoResponse(e.getId(), nome);
    }
}
