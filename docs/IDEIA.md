# Ideia Inicial do Projeto

## 1. O que cada perfil poderia acessar

### 1.1 Funcionário

Acesso individual aos próprios dados.

- **Ponto:** horários de entrada, saída e total de horas trabalhadas.
- **Holerites:** visualizar e baixar folhas de pagamento anteriores.
- **Solicitações:** enviar atestados, solicitar férias e atualizar dados bancários.
- **Pendências:** visualizar documentos faltantes, prazos e status.
- **Notificações:** receber avisos sobre pendências e fechamento da folha.
- **Dúvidas:** enviar perguntas ao RH ou à contabilidade e acompanhar as respostas.

### 1.2 Empresa / RH

Gestão dos funcionários e das pendências da empresa.

- **Visão geral:** total de funcionários, pendências abertas e prazos próximos.
- **Funcionários:** consultar colaboradores por setor, cargo e departamento.
- **Controle de ponto:** visualizar registros, faltas e marcações inconsistentes.
- **Folha de pagamento:** acompanhar o status de cada funcionário e do fechamento mensal.
- **Solicitações:** validar atestados, férias e alterações cadastrais.
- **Pendências:** atribuir responsáveis, definir prazos e cobrar documentos faltantes.
- **Comunicação:** responder dúvidas e acompanhar o histórico das conversas.

### 1.3 Contabilidade

Acesso às informações necessárias para processar a folha.

- **Empresas atendidas:** visualizar as empresas sob sua responsabilidade.
- **Fechamento da folha:** acompanhar o andamento e os prazos de cada empresa.
- **Documentos:** acessar documentos validados pelo RH e necessários para o cálculo.
- **Pendências:** solicitar correções ou documentos que estejam faltando.
- **Status:** marcar a folha como em processamento, calculada ou finalizada.
- **Dúvidas:** responder questões que dependam da contabilidade.

## 2. O que priorizar no desafio

Para não desenvolver um sistema grande demais, começar com estas funcionalidades:

- **Painel de pendências:** mostra o que falta, quem deve resolver e até quando.
- **Status da folha:** RH e contabilidade sabem em que etapa está o fechamento.
- **Envio de documentos:** o funcionário envia atestados e outros documentos diretamente pelo sistema.
- **Notificações:** avisa o responsável quando há uma pendência ou prazo próximo.
- **Histórico de solicitações:** permite consultar quem enviou, aprovou ou solicitou uma correção.

## 3. Exemplo de como funcionaria

**Pendência:** atestado médico
**Funcionário:** João · **Setor:** Produção
**Status:** Pendente

- **Funcionário:** envia o atestado pelo sistema.
- **RH:** valida o documento e encaminha à contabilidade.
- **Contabilidade:** confirma o recebimento e processa a informação na folha.

**Resultado:** todos acompanham a pendência sem precisar trocar mensagens por WhatsApp.

## 4. Recomendação para o MVP

Manter os três perfis, mas fazer da **central de pendências integrada ao fechamento da folha** o núcleo do sistema. O controle de ponto e os relatórios completos de funcionários podem ficar para uma versão futura.

### Controle de acesso

O funcionário deve visualizar apenas os próprios dados; o RH, os dados dos colaboradores autorizados da sua empresa; e a contabilidade, somente as informações das empresas e folhas sob sua responsabilidade. Dados bancários, holerites e atestados exigem controle de acesso rigoroso.

### Proposta de valor

Apresentar um produto com potencial de expansão que resolve um problema concreto do desafio: saber o que está faltando, quem precisa agir e qual é o prazo, sem ruído na comunicação.
