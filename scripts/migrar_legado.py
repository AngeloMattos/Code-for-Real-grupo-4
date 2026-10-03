from pathlib import Path
import json,re
r=Path(__file__).resolve().parents[1]
saida=r/'backend/src/main/resources/db/migration/V5__tipos_legados.sql'
if saida.exists(): raise SystemExit('Migration ja existe. Nao alterar migrations aplicadas.')
dados=json.loads((r/'dados-originais/fecha-comigo.json').read_text(encoding='utf-8'))
mapa={'atestado':'ATESTADO','afastamento':'ATESTADO','ferias':'FERIAS','cadastro':'ALTERACAO_CADASTRAL','dados_bancarios':'ALTERACAO_CADASTRAL','dependente':'ALTERACAO_CADASTRAL','alteracao_salarial':'CORRECAO_FOLHA','horas_extras':'AJUSTE_PONTO','ponto':'AJUSTE_PONTO','duvida_ponto':'AJUSTE_PONTO','admissao':'DOCUMENTO_SOLICITADO','documento_empresa':'DOCUMENTO_SOLICITADO','rescisao':'DOCUMENTO_SOLICITADO'}
sql=['-- Converte os tipos do JSON original para os enums do contrato, preservando titulos e descricoes.']
for i,p in enumerate(dados['pendencias'],1):
 tipo=mapa.get(p['tipo'],'DUVIDA');bloqueia=False if tipo=='DUVIDA' else p['bloqueia_fechamento'] or tipo in ['ATESTADO','FERIAS','AJUSTE_PONTO']
 sql.append(f"update pendencia set tipo='{tipo}',bloqueia_folha={str(bloqueia).lower()} where id={i};")
 if tipo=='ATESTADO':
  data=re.search(r'\b(\d{2})/(\d{2})\b',p['titulo'])
  periodo=f"'2026-{data[2]}-{data[1]}'" if data else 'null'
  sql.append(f'update pendencia set data_inicio={periodo},data_fim={periodo} where id={i};')
sql.append("update documento set tamanho_bytes="+str((r/'backend/uploads/1/atestado-demo.pdf').stat().st_size)+" where caminho_arquivo like '%/atestado-demo.pdf';")
saida.write_text('\n'.join(sql)+'\n',encoding='utf-8')
