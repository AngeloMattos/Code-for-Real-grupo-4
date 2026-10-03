-- Exemplos adicionais para apresentar atrasos, correcoes e conclusoes sem alterar a fonte original.
insert into pendencia (id,empresa_id,funcionario_id,criado_por_id,titulo,descricao,tipo,status,setor_responsavel,setor_solicitante,prazo,competencia,bloqueia_folha,abonado,criado_em,atualizado_em)
values (41,1,3,1,'Saida nao registrada em 19/10','Confira o horario de saida e registre o ajuste com justificativa.','AJUSTE_PONTO','ABERTA','RH',null,'2026-10-19','2026-10',true,false,'2026-10-19 09:00','2026-10-19 09:00'),
 (42,1,1,101,'Atestado aguardando documento corrigido','O RH solicitou uma nova imagem com a data final legivel.','ATESTADO','CORRECAO_SOLICITADA','FUNCIONARIO','RH','2026-10-21','2026-10',true,false,'2026-10-19 10:00','2026-10-19 14:00'),
 (43,1,2,1,'Alteracao cadastral confirmada','Endereco atualizado e conferido pelo RH.','ALTERACAO_CADASTRAL','CONCLUIDA','RH',null,'2026-10-18','2026-10',false,false,'2026-10-16 11:00','2026-10-19 15:00');
insert into pendencia_evento (empresa_id,pendencia_id,autor_id,tipo,status_novo,comentario,criado_em,atualizado_em)
values (1,41,1,'CRIADA','ABERTA','Pendencia criada para conferir a saida de 19/10.','2026-10-19 09:00','2026-10-19 09:00'),
 (1,42,101,'CRIADA','ABERTA','Atestado enviado para analise do RH.','2026-10-19 10:00','2026-10-19 10:00'),
 (1,42,1,'STATUS_ALTERADO','CORRECAO_SOLICITADA','A data final ficou ilegivel. Envie uma nova imagem do documento.','2026-10-19 14:00','2026-10-19 14:00'),
 (1,43,1,'STATUS_ALTERADO','CONCLUIDA','Cadastro conferido e atualizado.','2026-10-19 15:00','2026-10-19 15:00');
update pendencia set data_inicio='2026-10-19',data_fim='2026-10-19' where id=42;
insert into documento (empresa_id,pendencia_id,funcionario_id,enviado_por_id,nome_original,caminho_arquivo,content_type,tamanho_bytes,sensivel)
values (1,42,1,101,'atestado-demo.pdf','1/atestado-demo.pdf','application/pdf',800,true);
select setval(pg_get_serial_sequence('pendencia','id'),43,true);
