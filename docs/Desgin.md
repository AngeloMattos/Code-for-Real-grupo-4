# Folha Conecta — Design do Frontend (Angular)

> **Sobre este documento:** este é o guia de **design e frontend** da Folha Conecta. Ele define a identidade visual, as telas, os componentes e a estrutura do app Angular. Para a API, as entidades e as regras de negócio, consulte o [BACKEND.md](BACKEND.md).

3 de out. de 2026 · @Jorge Alejandro

## 1. Visão geral

Um único app Angular com login separado para Funcionário e Empresa. Cada usuário da empresa entra no seu setor (RH, Financeiro, Contabilidade ou Admin) e só vê o menu e as ações desse setor. A **Central de Pendências** é o coração do produto e conecta todos os setores.

- **Stack:** Angular 21 (componentes standalone e signals) no front e Spring Boot com Java 17 no back, comunicando por API REST com JWT.
- **Escopo:** o RH vê entradas e saídas (ponto) e o Financeiro tem a folha com um cálculo simples. As duas funções entram em versões enxutas, ligadas às pendências: uma marcação faltando no ponto vira pendência, e a folha só fecha quando as pendências bloqueantes acabam.
- **Quatro perguntas que toda tela responde:** o que aconteceu, o que está pendente, quem precisa resolver e qual é o prazo.

## 2. Identidade visual

Base neutra e clara, com um azul de confiança como cor da marca. A cor fica reservada para dar significado (status, prazo e setor), para que o olho vá direto ao que precisa de ação.

### Cores base

- **Marca (primária) `#2457D6`:** botões principais, links e item ativo do menu.
- **Marca hover `#1C46B0`:** hover e foco de botões.
- **Marca suave `#EAF0FD`:** fundo de item selecionado e destaques leves.
- **Sidebar `#0F1E3D`:** fundo do menu lateral (texto `#CBD5E1`, item ativo em branco).
- **Fundo do app `#F6F8FB`:** fundo atrás dos cards.
- **Superfície `#FFFFFF`:** cards, tabelas, drawer e modais.
- **Borda `#E3E8EF`:** divisórias e contornos.
- **Texto principal `#0F172A`:** títulos e conteúdo.
- **Texto secundário `#5B6678`:** legendas, datas e rótulos.

### Cores de status

O badge usa texto escuro sobre fundo claro.

- **Aberta:** texto `#1D4ED8`, fundo `#DBEAFE`.
- **Em análise:** texto `#B45309`, fundo `#FEF3C7`.
- **Correção solicitada:** texto `#C2410C`, fundo `#FFEDD5`.
- **Concluída:** texto `#15803D`, fundo `#DCFCE7`.
- **Atrasada** (sinal de prazo, não é status): texto `#B91C1C`, fundo `#FEE2E2`.

### Cores por setor

Usadas só no badge "Com quem está" e no avatar.

- **Funcionário:** `#0D9488`
- **RH:** `#7C3AED`
- **Financeiro:** `#0369A1`
- **Contabilidade:** `#BE185D`
- **Admin:** `#475569`

### Tipografia, espaço e ícones

- **Fonte:** Inter (Google Fonts), com números tabulares (`font-variant-numeric: tabular-nums`) em tabelas e valores em R$.
- **Escala:** 12 (legenda) · 14 (texto e tabela) · 16 (texto de formulário) · 20 (título de card) · 24 (título de página) · 30 (número de KPI). Pesos 400, 500 e 600.
- **Espaçamento:** múltiplos de 4 px; 24 px entre cards; 16 px de padding interno.
- **Cantos:** 8 px em botões e inputs; 12 px em cards e drawer.
- **Sombras:** quase nenhuma, separar por borda. Sombra só em drawer, modal e dropdown.
- **Ícones:** Lucide (`lucide-angular`), traço 1,75, tamanho 18 no menu e 16 em botões.
- **Acessibilidade:** contraste mínimo de 4,5:1 no texto; status nunca só por cor (sempre com o nome escrito); foco visível no teclado.
- **Modo escuro:** fora do MVP, mas usar variáveis CSS desde já para ligar depois.

## 3. Perfis de acesso e permissões

Cinco perfis, separados em dois tipos de login. O setor vem da conta do usuário (definido pelo Admin) e não é escolhido livremente no login.

### Funcionário

Vê só os próprios dados, pendências, ponto e holerites.

- **Dashboard:** pessoal.
- **Central de Pendências:** só as próprias.
- **Criar pendência:** como solicitação.
- **Funcionários:** próprio cadastro.
- **Ponto:** registrar e ver o próprio.
- **Holerites:** ver os próprios.

### RH

Cuida de pessoas, documentos, ponto e da preparação da folha.

- **Dashboard:** pessoas e prazos.
- **Central de Pendências:** todas.
- **Criar pendência:** sim, e atribuir.
- **Validar documentos e atestados:** sim (único setor que valida).
- **Funcionários:** ver e editar.
- **Ponto:** ver todos e ajustar.
- **Folha de pagamento:** ver status.

### Financeiro

Calcula a prévia da folha e publica os holerites.

- **Dashboard:** folha do mês.
- **Central de Pendências:** ligadas à folha.
- **Criar pendência:** sim.
- **Funcionários:** ver (sem documentos).
- **Ponto:** ver totais do mês.
- **Folha de pagamento:** calcular prévia.
- **Holerites:** publicar.

### Contabilidade

Confere e fecha a folha. Pode ser um escritório externo que atende várias empresas.

- **Dashboard:** carteira de empresas.
- **Central de Pendências:** enviadas pelo RH.
- **Criar pendência:** pedir documento ou correção.
- **Funcionários:** ver.
- **Folha de pagamento:** conferir e fechar.
- **Holerites:** ver.

### Admin da empresa

Cadastra usuários, define setores e dados da empresa.

- **Dashboard:** visão geral.
- **Central de Pendências:** todas (somente leitura).
- **Funcionários:** ver e editar.
- **Folha de pagamento:** ver status.
- **Usuários e setores:** gerenciar (exclusivo do Admin).

### Regras de privacidade (LGPD)

- O arquivo do atestado (com CID) só é visto pelo RH. Os outros setores recebem apenas o resultado: dias de afastamento e se foi abonado.
- Salários e holerites só aparecem para Financeiro, Contabilidade e o próprio funcionário.
- Toda ação fica registrada no histórico com quem fez e quando.

### Como implementar

- **Back:** Spring Security com os papéis `ROLE_FUNCIONARIO`, `ROLE_RH`, `ROLE_FINANCEIRO`, `ROLE_CONTABILIDADE` e `ROLE_ADMIN`. O JWT carrega usuarioId, empresaId e os papéis. Cada endpoint valida o papel e a empresa. **Quem garante a segurança é o back.**
- **Front:** guards de rota (`canMatch`) por papel, menu montado a partir dos papéis e uma diretiva `*temPermissao` para esconder botões. No front isso é só experiência de uso, não segurança.

## 4. Login e autenticação

Uma única tela de login com duas abas, **"Sou funcionário"** e **"Sou empresa"**. Depois do login, cada usuário vai direto para o dashboard do seu setor.

### Tela de login

- **Layout dividido:** à esquerda, um painel azul da marca com o nome do produto e a frase "Todas as pendências da folha em um só lugar"; à direita, o formulário em card branco. No celular, só o formulário.
- **Aba Sou funcionário:** CPF (com máscara) e senha.
- **Aba Sou empresa:** e-mail corporativo e senha. Serve para RH, Financeiro, Contabilidade e Admin.
- **Links:** "Esqueci minha senha" e "Primeiro acesso".
- **Erros:** mensagem genérica ("CPF ou senha inválidos") logo acima do botão, sem dizer qual campo errou.
- **Para a apresentação:** uma linha de botões "Entrar como demo: Funcionário · RH · Financeiro · Contabilidade", só no ambiente de demonstração.

### Outras telas de acesso

- **Primeiro acesso:** o RH cadastra o funcionário e o sistema gera um link de convite; o funcionário abre o link e cria a senha. No MVP, o link aparece na tela do RH para copiar (sem e-mail).
- **Recuperar senha:** no MVP, o pedido vira uma pendência para o Admin ou o RH redefinir. Envio por e-mail fica para depois.
- **Escolher setor:** só aparece se a pessoa tiver mais de um setor (por exemplo, RH e Admin).
- **Escolher empresa:** só para a Contabilidade, quando atende mais de uma empresa. Também fica como seletor no topo do app.
- **Sessão expirada:** aviso e volta para o login, guardando a página para retornar depois.

### Fluxo técnico

1. O front envia `POST /api/auth/login` com `{ tipo: "FUNCIONARIO" | "EMPRESA", login, senha }`.
2. O Spring devolve um access token JWT (15 min) e um refresh token em cookie HttpOnly.
3. Um interceptor do Angular coloca `Authorization: Bearer` em toda chamada e renova o token quando recebe 401.
4. O front lê os papéis do token para montar o menu e decidir a rota inicial.

## 5. Telas principais

Todas as telas usam o mesmo layout base. A Central de Pendências e o fluxo do atestado são as telas mais caprichadas, porque aparecem na apresentação.

### Layout base

- **Sidebar** fixa de 240 px, que vira menu recolhível abaixo de 1024 px. No topo, a logo; embaixo, o usuário com o badge do setor.
- **Barra superior:** busca global (funcionário ou pendência), seletor de competência ("Outubro/2026"), sino com contador e menu do usuário.
- **Cabeçalho da página:** título, uma linha explicando a página e a ação principal à direita (por exemplo, "+ Nova pendência").

### Dashboards

- **Linha de 4 KPIs:** abertas, vencem em 3 dias, atrasadas e aguardando validação. Cada card é clicável e abre a Central já filtrada.
- **"Precisa da sua ação":** as 5 pendências com prazo mais próximo que estão com o setor logado. É o bloco mais importante.
- **Fechamento da folha:** barra de etapas (Ponto → Documentos → Prévia → Conferência → Fechada), com o texto "Bloqueada por 3 pendências" quando for o caso.
- **Últimas atividades:** linha do tempo curta ("Maria enviou atestado · há 10 min").
- **Funcionário:** no lugar dos KPIs, cards grandes de ação ("Enviar atestado", "Registrar ponto", "Meu último holerite") e as solicitações em andamento.

### Central de Pendências

- **Abas rápidas:** Comigo · Todas · Atrasadas · Vencem esta semana · Concluídas.
- **Filtros:** busca, tipo, status, setor responsável, funcionário e período. Os filtros ativos aparecem como chips removíveis.
- **Colunas:**
  - Título (com o tipo embaixo, em cinza).
  - Funcionário (avatar e nome).
  - Com quem está (badge do setor).
  - Prazo (data e "em 2 dias", ou "atrasada 1 dia" em vermelho).
  - Status (badge).
  - Última atualização ("há 2 h"). A data de criação fica no detalhe.
- **Ordenação padrão:** atrasadas primeiro e depois por prazo.
- **Clique na linha:** abre um drawer de 480 px à direita, sem sair da lista.

### Drawer de detalhe da pendência

1. **Cabeçalho:** título, status, com quem está e prazo.
2. **Dados:** funcionário, tipo, criada em, criada por e responsável.
3. **Documento:** miniatura do arquivo e botão "Visualizar" (só para quem tem permissão).
4. **Histórico:** linha do tempo com cada ação, quem fez e quando, mais um campo de comentário.
5. **Ações fixas no rodapé, conforme o setor:** o RH vê "Aprovar" e "Solicitar correção"; a Contabilidade vê "Concluir" e "Pedir documento"; o Funcionário vê "Reenviar documento" quando houver correção.

### Enviar atestado (Funcionário)

- **Formulário curto:** tipo (Atestado, Férias, Alteração cadastral, Dúvida), data inicial e final, arquivo por arrastar e soltar (PDF ou imagem, até 5 MB) e observação.
- **Confirmação:** "Enviado ao RH. Prazo de análise: 2 dias úteis", com um botão para acompanhar a solicitação.

### Ponto (entrada e saída)

- **Funcionário:** relógio grande e botão "Registrar entrada", que alterna para saída; abaixo, as marcações do dia e o espelho do mês.
- **RH:** tabela por funcionário e dia com entrada, saída, total de horas e horas extras. Dias com marcação faltando ficam destacados, com o botão "Criar pendência". O ajuste manual exige justificativa e vai para o histórico.
- **Fora do MVP:** geolocalização, biometria, escalas complexas e banco de horas.

### Folha de pagamento (Financeiro)

- **Tabela** com uma linha por funcionário: salário base, horas extras, faltas, descontos, líquido e situação (OK ou "bloqueado: atestado em análise").
- **Botão "Calcular prévia":** só libera "Enviar para a contabilidade" quando não houver bloqueios.
- **Clique na linha:** drawer com a memória de cálculo, mostrando cada valor e de onde veio (por exemplo, "2 faltas do ponto em 14/10 e 15/10").
- **Cálculo simplificado do MVP:**
  - Líquido = Salário base + HE − Faltas − INSS − IRRF − VT.
  - Hora extra: (salário ÷ 220) × 1,5 × horas extras.
  - Falta: (salário ÷ 30) × dias sem justificativa. Atestado aprovado pelo RH abona a falta.
  - INSS e IRRF por tabela progressiva configurável; VT de 6% do salário.
  - A tela deve deixar claro que é uma **"prévia"**.
- **Fora do MVP:** férias, 13º, rescisão, adicionais e dependentes detalhados.

### Holerites (Funcionário)

- Lista por mês com o valor líquido. Ao abrir, mostra proventos e descontos lado a lado e um botão "Baixar PDF".
- O holerite só aparece depois que o Financeiro publica.

### Carteira de empresas (Contabilidade)

- Um card por empresa com o status da folha do mês, o número de pendências abertas e o prazo de fechamento.
- Ao entrar na empresa, a Contabilidade vê a conferência da folha e os documentos do fechamento.

### Estados de toda tela

- **Carregando:** skeleton (blocos cinza) no formato do conteúdo, e não spinner.
- **Vazio:** ícone, frase e uma ação ("Nenhuma pendência com você. Tudo em dia!").
- **Erro:** mensagem clara e botão "Tentar de novo".
- **Sucesso:** toast no canto ("Atestado aprovado e enviado à contabilidade").

## 6. Estrutura do projeto Angular

Angular 21 com **PrimeNG** (tabela, drawer, calendário, upload e toast prontos) e um tema próprio com as cores deste guia. Isso economiza dias de trabalho em componentes complexos.

### Bibliotecas

- **primeng + @primeuix/themes:** componentes, com o preset de tema ajustado às cores da marca.
- **lucide-angular:** ícones.
- **ngx-mask:** máscaras de CPF, data e moeda.
- **Locale pt-BR registrado:** datas no formato 03/10/2026 e valores em R$ 1.234,56.

### Componentes compartilhados

- **app-shell:** sidebar, barra superior e área de conteúdo.
- **page-header:** título, descrição e ação principal da página.
- **kpi-card:** número grande, rótulo e variação; clicável.
- **status-badge:** badge de status com cor e texto.
- **setor-badge:** "Com quem está", com a cor do setor.
- **prazo-label:** data e "em 2 dias", ou "atrasada" em vermelho.
- **pendencias-table:** tabela da Central, reaproveitada nos dashboards.
- **pendencia-drawer:** detalhe, histórico e ações por setor.
- **timeline:** histórico de eventos (pendência e dashboard).
- **folha-stepper:** etapas do fechamento da folha.
- **upload-dropzone:** envio de arquivo por arrastar e soltar.
- **empty-state:** estado vazio com ícone, frase e ação.

### Pastas

```
src/app/
  core/
    auth/          auth.service.ts, auth.interceptor.ts, role.guard.ts
    api/           pendencias.api.ts, funcionarios.api.ts, ponto.api.ts, folha.api.ts
    models/        pendencia.ts, funcionario.ts, ponto.ts, folha.ts, usuario.ts
  shared/
    components/    (componentes compartilhados acima)
    directives/    tem-permissao.directive.ts
    pipes/         tempo-relativo.pipe.ts, cpf.pipe.ts
  layout/          app-shell, sidebar, topbar
  features/
    auth/          login, primeiro-acesso, recuperar-senha, escolher-setor
    pendencias/    central, nova-pendencia
    funcionario/   inicio, enviar-documento, meu-ponto, holerites, meus-dados
    rh/            dashboard, funcionarios, validacao, ponto-equipe, fechamento
    financeiro/    dashboard, folha, holerites
    contabilidade/ carteira, empresa-fechamento, documentos
    admin/         usuarios, empresa
```

### Rotas principais

- `/login` — login com as duas abas. Público.
- `/inicio` — dashboard do setor logado. Todos.
- `/pendencias` — Central de Pendências. Todos (filtrada pelo setor).
- `/solicitacoes/nova` — enviar documento ou atestado. Funcionário.
- `/ponto` — meu ponto ou ponto da equipe. Funcionário, RH.
- `/holerites` — meus holerites. Funcionário.
- `/funcionarios` — lista com filtro por setor. RH, Admin.
- `/documentos` — validação de documentos. RH.
- `/folha` — prévia e fechamento da folha. RH (status), Financeiro, Contabilidade.
- `/empresas` — carteira de empresas. Contabilidade.
- `/admin/usuarios` — usuários e setores. Admin.

### Boas práticas para o time

- Cada `*.api.ts` implementa uma interface. No começo, uma versão com dados fictícios; quando o Spring estiver pronto, troca só o provider, sem mexer nas telas.
- Estado com signals nos services; nada de NgRx para um MVP.
- `apiUrl` em `environment.ts`, apontando para `http://localhost:8080/api`.
- Os modelos TypeScript espelham os DTOs do Spring, com os mesmos nomes de campos e enums (`StatusPendencia`, `Setor`, `TipoPendencia`).

## 7. Escopo, riscos e ordem de construção

O maior risco é o escopo: ponto e cálculo de folha são, cada um, um sistema inteiro. Construam primeiro o fluxo do atestado de ponta a ponta e só depois o ponto e a folha simplificados.

### Ordem sugerida

1. Tokens de design, tema do PrimeNG e app-shell (sidebar e barra superior).
2. Login com as duas abas, guards por papel e usuários de demonstração (ainda com dados fictícios).
3. Central de Pendências com filtros e drawer de detalhe.
4. Fluxo do atestado completo: enviar, validar no RH, chegar à Contabilidade e concluir.
5. Dashboards dos quatro setores.
6. Ponto simples: registrar, espelho e tabela do RH com marcações faltando.
7. Folha simplificada: prévia, bloqueios por pendência e envio para a Contabilidade.
8. Holerites e carteira de empresas.
9. Ligar no Spring Boot, endpoint por endpoint, trocando os providers fictícios.
10. Polimento da demo: dados de exemplo realistas, estados vazios e um roteiro de apresentação.

### Riscos e como evitar

- **O cálculo da folha ficar grande demais:** só salário, HE, faltas, INSS, IRRF e VT; chamar de "prévia".
- **O ponto virar um sistema à parte:** só entrada e saída; o que faltar vira pendência.
- **Front e back saírem de sincronia:** combinar os DTOs e enums no primeiro dia; usar dados fictícios no front até o back ficar pronto.
- **Segurança só no front:** toda regra de permissão validada no Spring Security.
- **Demo falhar ao vivo:** dados de exemplo fixos e um botão "resetar demo".
