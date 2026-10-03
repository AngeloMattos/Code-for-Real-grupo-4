from pathlib import Path
import json,datetime
r=Path(__file__).resolve().parents[1]
d=json.loads((r/'dados-originais/fecha-comigo.json').read_text(encoding='utf-8'))
sql=['-- Dados ficticios preservados do arquivo fornecido. Senha da demo: Demo@2026.']
hash_senha='$2a$10$0wCBj5HuTEXyLUxxs8ZW9Og2pkyysi88EYaojGXgIq2SWsop7IbT.'
def valor(v):
 if v is None:return 'null'
 if isinstance(v,bool):return str(v).lower()
 if isinstance(v,(int,float)):return str(v)
 return "'"+str(v).replace("'","''")+"'"
def inserir(tabela,**campos):sql.append(f"insert into {tabela} ({','.join(campos)}) values ({','.join(map(valor,campos.values()))});")
eid={e['id']:i+1 for i,e in enumerate(d['empresas'])}; fid={f['id']:i+1 for i,f in enumerate(d['funcionarios'])}
for e in d['empresas']:inserir('empresa',id=eid[e['id']],razao_social=e['nome'],nome_fantasia=e['nome'],cnpj=f"00000000000{eid[e['id']]:03}",dia_fechamento=23)
for uid,nome,email,papel,empresas in [(1,d['empresas'][0]['rh_nome'],'rh@demo.com','RH',[1]),(2,'Camila Ferreira','financeiro@demo.com','FINANCEIRO',[1]),(3,'Ana Costa','contabil@demo.com','CONTABILIDADE',list(eid.values())),(4,'Arthur Rodrigues','admin@demo.com','ADMIN',[1])]+[(10+i,e['rh_nome'],e['rh_email'],'RH',[eid[e['id']]]) for i,e in enumerate(d['empresas'])]:
 inserir('usuario',id=uid,nome=nome,email=email,senha_hash=hash_senha,tipo_login='EMPRESA',ativo=True)
 inserir('usuario_papel',usuario_id=uid,papel=papel)
 for empresa in empresas:inserir('usuario_empresa',usuario_id=uid,empresa_id=empresa)
for f in d['funcionarios']:
 id=fid[f['id']];cpf=f'{id:011}';uid=100+id;empresa=eid[f['empresa_id']]
 inserir('usuario',id=uid,nome=f['nome'],cpf=cpf,senha_hash=hash_senha,tipo_login='FUNCIONARIO',ativo=True)
 inserir('usuario_papel',usuario_id=uid,papel='FUNCIONARIO');inserir('usuario_empresa',usuario_id=uid,empresa_id=empresa)
 inserir('funcionario',id=id,usuario_id=uid,empresa_id=empresa,nome=f['nome'],cpf=cpf,matricula=f['id'],cargo=f['cargo'],departamento=f['setor'],salario_base=f['salario_base'],carga_horaria_mensal=220,data_admissao=f['data_admissao'],ativo=f['situacao']=='ativo')
 for mes in [9,10]:
  for dia in range(1,31):
   data=datetime.date(2026,mes,dia)
   if data.weekday()<5 and (mes==9 or dia<=20):
    faltando=mes==10 and dia==19 and id in [1,3]
    inserir('registro_ponto',empresa_id=empresa,funcionario_id=id,data=str(data),entrada='08:00',saida=None if faltando else ('17:00' if dia==16 and id==1 else '16:00'),ajustado=False)
for i,p in enumerate(d['pendencias'],1):
 empresa=eid[p['empresa_id']];f=fid.get(p['funcionario_id'],next(fid[x['id']] for x in d['funcionarios'] if x['empresa_id']==p['empresa_id']))
 setor=p['responsavel'].upper();status='CONCLUIDA' if p['status']=='resolvida' else 'CORRECAO_SOLICITADA' if p['status']=='aguardando_funcionario' else 'ABERTA' if p['status']=='aberta' else 'EM_ANALISE'
 tipo={'atestado':'ATESTADO','ferias':'FERIAS','duvida_ponto':'AJUSTE_PONTO','dados_bancarios':'ALTERACAO_CADASTRAL','admissao':'DOCUMENTO_SOLICITADO'}.get(p['tipo'],'DUVIDA')
 prazo=p['prazo'] or '2026-10-23';criada=p['criada_em']+' 09:00';atual=p['historico'][-1]['data']+' 09:00' if p['historico'] else criada
 inserir('pendencia',id=i,empresa_id=empresa,funcionario_id=f,criado_por_id=100+f if p['aberta_por']=='funcionario' else 10+empresa-1 if p['aberta_por']=='rh' else 3,titulo=p['titulo'],descricao=p['descricao'],tipo=tipo,status=status,setor_responsavel=setor,setor_solicitante='RH' if status=='CORRECAO_SOLICITADA' else None,prazo=prazo,competencia='2026-10',bloqueia_folha=p['bloqueia_fechamento'] or tipo in ['ATESTADO','FERIAS','AJUSTE_PONTO'],abonado=tipo in ['ATESTADO','FERIAS'] and setor=='CONTABILIDADE',criado_em=criada,atualizado_em=atual,data_inicio='2026-10-19' if tipo=='ATESTADO' else None,data_fim='2026-10-19' if tipo=='ATESTADO' else None)
 for n,h in enumerate(p['historico']):inserir('pendencia_evento',empresa_id=empresa,pendencia_id=i,autor_id=100+f if h['papel']=='funcionario' else 10+empresa-1 if h['papel']=='rh' else 3,tipo='CRIADA' if n==0 else 'COMENTARIO',status_novo=status,comentario=h['mensagem'],criado_em=h['data']+' 09:00',atualizado_em=h['data']+' 09:00')
 if tipo=='ATESTADO':inserir('documento',empresa_id=empresa,pendencia_id=i,funcionario_id=f,enviado_por_id=100+f,nome_original='atestado-demo.pdf',caminho_arquivo=f'{empresa}/atestado-demo.pdf',content_type='application/pdf',tamanho_bytes=800,sensivel=True)
folhas={};indice=1
for empresa in eid.values():
 for mes in ['2026-08','2026-09','2026-10']:
  folhas[(empresa,mes)]=indice;inserir('folha',id=indice,empresa_id=empresa,competencia=mes,status='ABERTA' if mes=='2026-10' else 'FECHADA',calculada_em=None if mes=='2026-10' else '2026-10-01 10:00',fechada_em=None if mes=='2026-10' else '2026-10-02 10:00',fechada_por_id=None if mes=='2026-10' else 3);indice+=1
for h in d['holerites']:
 f=next(f for f in d['funcionarios'] if f['id']==h['funcionario_id']);salario=f['salario_base'];descontos={e['descricao']:e['valor'] for e in h['eventos'] if e['tipo']=='desconto'}
 inserir('item_folha',empresa_id=eid[f['empresa_id']],folha_id=folhas[(eid[f['empresa_id']],h['competencia'])],funcionario_id=fid[f['id']],salario_base=salario,horas_extras=0,valor_horas_extras=0,dias_falta=0,valor_faltas=0,inss=descontos.get('INSS',0),irrf=descontos.get('IRRF',0),vale_transporte=descontos.get('Vale-transporte',0),liquido=h['liquido'],memoria_calculo=json.dumps({'origem':'Dados ficticios fornecidos, descontos ilustrativos','eventos':h['eventos']},ensure_ascii=False),publicado=True)
for t in ['empresa','usuario','funcionario','pendencia','folha']:sql.append(f"select setval(pg_get_serial_sequence('{t}','id'),coalesce((select max(id) from {t}),1),true);")
p=r/'backend/src/main/resources/db/migration/V2__dados_demo.sql';p.write_text('\n'.join(sql)+'\n',encoding='utf-8')
# Documento inequivocamente ficticio para testar autorizacao e visualizacao.
objetos=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
texto=b'BT /F1 20 Tf 60 750 Td (Folha Conecta - Atestado ficticio) Tj 0 -40 Td /F1 12 Tf (Arquivo de demonstracao. Sem validade medica.) Tj ET';objetos.append(b'<< /Length '+str(len(texto)).encode()+b' >>\nstream\n'+texto+b'\nendstream')
pdf=b'%PDF-1.4\n';offsets=[]
for i,o in enumerate(objetos,1):offsets.append(len(pdf));pdf+=f'{i} 0 obj\n'.encode()+o+b'\nendobj\n'
xref=len(pdf);pdf+=f'xref\n0 {len(objetos)+1}\n0000000000 65535 f \n'.encode()+b''.join(f'{o:010} 00000 n \n'.encode() for o in offsets)+f'trailer << /Size {len(objetos)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF'.encode()
for empresa in eid.values():
 pasta=r/f'backend/uploads/{empresa}';pasta.mkdir(parents=True,exist_ok=True);(pasta/'atestado-demo.pdf').write_bytes(pdf)
