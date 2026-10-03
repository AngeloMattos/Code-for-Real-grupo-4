package br.com.folhaconecta.shared.web;
import java.util.List; import org.springframework.data.domain.Page;
public record PaginaResponse<T>(List<T> content,int number,int size,long totalElements,int totalPages){
 public static <T> PaginaResponse<T> de(Page<T> pagina){return new PaginaResponse<>(pagina.getContent(),pagina.getNumber(),pagina.getSize(),pagina.getTotalElements(),pagina.getTotalPages());}
}
