package br.com.folhaconecta.shared.web;
import java.util.*;
public record ErroResponse(int status,String erro,String mensagem,Map<String,String> campos,List<?> bloqueios){}
