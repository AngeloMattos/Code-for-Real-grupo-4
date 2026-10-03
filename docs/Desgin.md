Folha Conecta — Guia de Design e Frontend
3 de out. de 2026 · @Jorge Alejandro
Visão geral
Recomendação: um único app Angular com login separado para Funcionário e Empresa, em que cada usuário da empresa entra no seu setor (RH, Financeiro, Contabilidade ou Admin) e só vê o menu e as ações do setor. A Central de Pendências continua sendo o coração do produto e conecta todos os setores.
• Stack: Angular 21 (componentes standalone, signals) no front e Spring Boot com Java 17 no back, comunicando por API REST com JWT.
• Escopo novo: o RH passa a ver entradas e saídas (ponto) e o Financeiro passa a ter a folha com um cálculo simples. As duas coisas entram como versões enxutas, ligadas às pendências: uma marcação faltando no ponto vira pendência, e a folha só fecha quando as pendências bloqueantes acabam.
• Quatro perguntas que toda tela responde: o que aconteceu, o que está pendente, quem precisa resolver e qual é o prazo.
Identidade visual
Uma base neutra e clara, com um azul de confiança como cor da marca e a cor reservada para dar significado: status, prazo e setor. Assim o olho vai direto para o que precisa de ação.
Cores base
Papel
Hex
Onde usar
Marca (primária)
#2457D6
Botões principais, links, item ativo do menu
Marca hover
#1C46B0
Hover e foco de botões
Marca suave
#EAF0FD
Fundo de item selecionado, destaques leves
Sidebar
#0F1E3D
Fundo do menu lateral (texto #CBD5E1, ativo branco)
Fundo do app
#F6F8FB
Fundo atrás dos cards
Superfície
#FFFFFF
Cards, tabelas, drawer, modais
Borda
#E3E8EF
Divisórias e contornos
Texto principal
#0F172A
Títulos e conteúdo
Texto secundário
#5B6678
Legendas, datas, rótulos
Cores de status (badge = texto escuro sobre fundo claro)
Status
Texto
Fundo
Aberta
#1D4ED8
#DBEAFE
Em análise
#B45309
#FEF3C7
Correção solicitada
#C2410C
#FFEDD5
Concluída
#15803D
#DCFCE7
Atrasada (sinal de prazo, não status)
#B91C1C
#FEE2E2
Cor por setor (só no badge “Com quem está” e no avatar)
Setor
Hex
Funcionário
#0D9488
RH
#7C3AED
Financeiro
#0369A1
Contabilidade
#BE185D
Admin
#475569
Tipografia, espaço e ícones
• Fonte: Inter (Google Fonts), com números tabulares (font-variant-numeric: tabular-nums) em tabelas e valores em R$.
• Escala: 12 (legenda) · 14 (texto e tabela) · 16 (texto de formulário) · 20 (título de card) · 24 (título de página) · 30 (número de KPI). Pesos 400, 500 e 600.
• Espaçamento: múltiplos de 4 px; 24 px entre cards; 16 px de padding interno.
• Cantos: 8 px em botões e inputs, 12 px em cards e drawer.
• Sombras: quase nenhuma; separar por borda. Sombra só em drawer, modal e dropdown.
• Ícones: Lucide (lucide-angular), traço 1,75, tamanho 18 no menu e 16 em botões.
• Acessibilidade: contraste mínimo 4,5:1 no texto; status nunca só por cor (sempre com o nome escrito); foco visível no teclado.
• Modo escuro: fica fora do MVP; usar variáveis CSS desde já para ligar depois.
Perfis de acesso e permissões
Cinco perfis, separados em dois tipos de login. O setor vem da conta do usuário (definido pelo Admin), e não é escolhido livremente no login.
• Funcionário: vê só os próprios dados, pendências, ponto e holerites.
• RH: cuida de pessoas, documentos, ponto e da preparação da folha.
• Financeiro: calcula a prévia da folha e publica os holerites.
• Contabilidade: confere e fecha a folha; pode ser um escritório externo que atende várias empresas.
• Admin da empresa: cadastra usuários, define setores e dados da empresa.
Matriz de permissões
Funcionalidade
Funcionário
RH
Financeiro
Contabilidade
Admin
Dashboard
Pessoal
Pessoas e prazos
Folha do mês
Carteira de empresas
Visão geral
Central de Pendências
Próprias
Todas
Ligadas à folha
Enviadas pelo RH
Todas (leitura)
Criar pendência
Como solicitação
Sim, e atribuir
Sim
Pedir documento ou correção
—
Validar documentos e atestados
—
Sim
—
—
—
Funcionários
Próprio cadastro
Ver e editar
Ver (sem documentos)
Ver
Ver e editar
Ponto (entrada e saída)
Registrar e ver o próprio
Ver todos e ajustar
Ver totais do mês
—
—
Folha de pagamento
—
Ver status
Calcular prévia
Conferir e fechar
Ver status
Holerites
Ver os próprios
—
Publicar
Ver
—
Usuários e setores
—
—
—
—
Gerenciar
Regras de privacidade (LGPD)
• O arquivo do atestado (com CID) só é visto pelo RH. Os outros setores recebem apenas o resultado: dias de afastamento e se foi abonado.
• Salários e holerites só aparecem para Financeiro, Contabilidade e o próprio funcionário.
• Toda ação fica registrada no histórico com quem fez e quando.
Como implementar
• Back: Spring Security com papéis ROLE_FUNCIONARIO, ROLE_RH, ROLE_FINANCEIRO, ROLE_CONTABILIDADE, ROLE_ADMIN; o JWT carrega usuarioId, empresaId e os papéis. Cada endpoint valida o papel e a empresa. Quem garante a segurança é o back.
• Front: guards de rota (canMatch) por papel, um menu montado a partir dos papéis e uma diretiva *temPermissao para esconder botões. No front isso é só experiência de uso, não segurança.
Login e autenticação
Uma única tela de login com duas abas, “Sou funcionário” e “Sou empresa”. Depois do login, o sistema leva cada um direto para o dashboard do seu setor.
Tela de login
• Layout dividido: à esquerda, um painel azul da marca com o nome do produto e uma frase de valor (“Todas as pendências da folha em um só lugar”); à direita, o formulário em card branco. No celular, só o formulário.
• Aba Sou funcionário: CPF (com máscara) e senha.
• Aba Sou empresa: e-mail corporativo e senha. Serve para RH, Financeiro, Contabilidade e Admin.
• Links: “Esqueci minha senha” e “Primeiro acesso”.
• Erros: mensagem genérica (“CPF ou senha inválidos”) logo acima do botão, sem dizer qual campo errou.
• Para a apresentação: uma linha de botões “Entrar como demo: Funcionário · RH · Financeiro · Contabilidade”, só no ambiente de demonstração.
Outras telas de acesso
• Primeiro acesso: o RH cadastra o funcionário e o sistema gera um link de convite; o funcionário abre o link e cria a senha. No MVP, o link aparece na tela do RH para copiar (sem e-mail).
• Recuperar senha: no MVP, o pedido vira uma pendência para o Admin ou o RH redefinir. Envio por e-mail fica para depois.
• Escolher setor: só aparece se a pessoa tiver mais de um setor (por exemplo, RH e Admin).
• Escolher empresa: só para a Contabilidade, quando atende mais de uma empresa. Também fica como seletor no topo do app.
• Sessão expirada: aviso e volta para o login, guardando a página para retornar depois.
Fluxo técnico
1. O front envia POST /api/auth/login com { tipo: "FUNCIONARIO" | "EMPRESA", login, senha }.
2. O Spring devolve um access token JWT (15 min) e um refresh token (o ideal é em cookie HttpOnly).
3. Um interceptor do Angular coloca Authorization: Bearer em toda chamada e renova o token quando recebe 401.
4. O front lê os papéis do token para montar o menu e decidir a rota inicial.
Detalhe das telas principais
Todas as telas usam o mesmo layout base. A Central de Pendências e o fluxo do atestado são as telas mais caprichadas, porque são elas que aparecem na apresentação.
Layout base
• Sidebar fixa de 240 px, que vira um menu recolhível abaixo de 1024 px. No topo, a logo; embaixo, o usuário com o badge do setor.
• Barra superior: busca global (funcionário ou pendência), seletor de competência (“Outubro/2026”), sino com contador e menu do usuário.
• Cabeçalho da página: título, uma linha explicando a página e a ação principal à direita (por exemplo, “+ Nova pendência”).
Dashboards
• Linha de 4 KPIs: abertas, vencem em 3 dias, atrasadas e aguardando validação. Cada card é clicável e abre a Central já filtrada.
• Bloco “Precisa da sua ação”: as 5 pendências com prazo mais próximo que estão com o setor logado. É o bloco mais importante.
• Fechamento da folha: barra de etapas (Ponto → Documentos → Prévia → Conferência → Fechada), com o texto “Bloqueada por 3 pendências” quando for o caso.
• Últimas atividades: linha do tempo curta (“Maria enviou atestado · há 10 min”).
• Funcionário: no lugar dos KPIs, cards grandes de ação: “Enviar atestado”, “Registrar ponto”, “Meu último holerite”, mais as solicitações em andamento.
Central de Pendências
• Abas rápidas: Comigo · Todas · Atrasadas · Vencem esta semana · Concluídas.
• Filtros: busca, tipo, status, setor responsável, funcionário e período. Os filtros ativos aparecem como chips removíveis.
• Colunas: Título (com o tipo embaixo, em cinza) · Funcionário (avatar e nome) · Com quem está (badge do setor) · Prazo (data e “em 2 dias” ou “atrasada 1 dia” em vermelho) · Status (badge) · Última atualização (“há 2 h”). A data de criação fica no detalhe.
• Ordenação padrão: atrasadas primeiro e depois por prazo.
• Clique na linha: abre um drawer de 480 px à direita, sem sair da lista.
Drawer de detalhe da pendência
1. Cabeçalho: título, status, com quem está e prazo.
2. Dados: funcionário, tipo, criada em, criada por e responsável.
3. Documento: miniatura do arquivo e botão “Visualizar” (só para quem tem permissão).
4. Histórico: linha do tempo com cada ação, quem fez e quando, mais um campo de comentário.
5. Ações fixas no rodapé, conforme o setor: o RH vê “Aprovar” e “Solicitar correção”; a Contabilidade vê “Concluir” e “Pedir documento”; o Funcionário vê “Reenviar documento” quando houver correção.
Enviar atestado (Funcionário)
• Formulário curto: tipo (Atestado, Férias, Alteração cadastral, Dúvida), data inicial e final, arquivo por arrastar e soltar (PDF ou imagem, até 5 MB) e observação.
• Tela de confirmação: “Enviado ao RH. Prazo de análise: 2 dias úteis”, com um botão para acompanhar a solicitação.
Ponto (entrada e saída)
• Funcionário: relógio grande e um botão “Registrar entrada”, que alterna para saída; abaixo, as marcações do dia e o espelho do mês.
• RH: tabela por funcionário e dia com entrada, saída, total de horas e horas extras. Dias com marcação faltando ficam destacados, com o botão “Criar pendência”. O ajuste manual exige justificativa e vai para o histórico.
• Fora do MVP: geolocalização, biometria, escalas complexas e banco de horas.
Folha de pagamento (Financeiro)
• Tabela com uma linha por funcionário: salário base, horas extras, faltas, descontos, líquido e situação (OK ou “bloqueado: atestado em análise”).
• Botão “Calcular prévia”, que só libera “Enviar para a contabilidade” quando não houver bloqueios.
• Clique na linha: drawer com a memória de cálculo, mostrando cada valor e de onde veio (por exemplo, “2 faltas do ponto em 14/10 e 15/10”).
• Cálculo simplificado do MVP:
\text{Líquido} = \text{Salário base} + \text{HE} - \text{Faltas} - \text{INSS} - \text{IRRF} - \text{VT}
• Hora extra: (salário ÷ 220) × 1,5 × horas extras. Falta: (salário ÷ 30) × dias sem justificativa. Atestado aprovado pelo RH abona a falta.
• INSS e IRRF por tabela progressiva configurável, e VT de 6% do salário. A tela deve dizer que é uma “prévia”.
• Fora do MVP: férias, 13º, rescisão, adicionais e dependentes detalhados.
Holerites (Funcionário)
• Lista por mês com o valor líquido; ao abrir, mostra proventos e descontos lado a lado e um botão “Baixar PDF”. O holerite só aparece depois que o Financeiro publica.
Carteira de empresas (Contabilidade)
• Um card por empresa com o status da folha do mês, o número de pendências abertas e o prazo de fechamento. Ao entrar na empresa, ela vê a conferência da folha e os documentos do fechamento.
Estados de toda tela
• Carregando: skeleton (blocos cinza) no formato do conteúdo, e não um spinner.
• Vazio: ícone, frase e uma ação (“Nenhuma pendência com você. Tudo em dia!”).
• Erro: mensagem clara e botão “Tentar de novo”.
• Sucesso: toast no canto (“Atestado aprovado e enviado à contabilidade”).
Componentes e estrutura do projeto Angular
Recomendo Angular 21 com PrimeNG (tabela, drawer, calendário, upload e toast prontos) e um tema próprio com as cores deste guia. Isso economiza dias de trabalho em componentes complexos.
Bibliotecas
• primeng + @primeuix/themes: componentes, com o preset de tema ajustado às cores da marca.
• lucide-angular: ícones.
• ngx-mask: máscaras de CPF, data e moeda.
• Locale pt-BR registrado, para datas no formato 03/10/2026 e valores em R$ 1.234,56.
Componentes compartilhados
Componente
Para quê
app-shell
Sidebar, barra superior e área de conteúdo
page-header
Título, descrição e ação principal da página
kpi-card
Número grande, rótulo e variação; clicável
status-badge
Badge de status com cor e texto
setor-badge
“Com quem está”, com a cor do setor
prazo-label
Data e “em 2 dias” ou “atrasada” em vermelho
pendencias-table
Tabela da Central, reaproveitada nos dashboards
pendencia-drawer
Detalhe, histórico e ações por setor
timeline
Histórico de eventos (pendência e dashboard)
folha-stepper
Etapas do fechamento da folha
upload-dropzone
Envio de arquivo por arrastar e soltar
empty-state
Estado vazio com ícone, frase e ação
Pastas
src/app/
  core/
    auth/          auth.service.ts, auth.interceptor.ts, role.guard.ts
    api/           pendencias.api.ts, funcionarios.api.ts, ponto.api.ts, folha.api.ts
    models/        pendencia.ts, funcionario.ts, ponto.ts, folha.ts, usuario.ts
  shared/
    components/    (tabela acima)
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
Rotas principais
Rota
Página
Quem acessa
/login
Login com as duas abas
Público
/inicio
Dashboard do setor logado
Todos
/pendencias
Central de Pendências
Todos (filtrada pelo setor)
/solicitacoes/nova
Enviar documento ou atestado
Funcionário
/ponto
Meu ponto ou ponto da equipe
Funcionário, RH
/holerites
Meus holerites
Funcionário
/funcionarios
Lista com filtro por setor
RH, Admin
/documentos
Validação de documentos
RH
/folha
Prévia e fechamento da folha
RH (status), Financeiro, Contabilidade
/empresas
Carteira de empresas
Contabilidade
/admin/usuarios
Usuários e setores
Admin
Boas práticas para o time
• Cada *.api.ts implementa uma interface. No começo, uma versão com dados fictícios; quando o Spring estiver pronto, troca só o provider, sem mexer nas telas.
• Estado com signals nos services; nada de NgRx para um MVP.
• apiUrl em environment.ts, apontando para http://localhost:8080/api.
• Os modelos TypeScript espelham os DTOs do Spring, com os mesmos nomes de campos e enums (StatusPendencia, Setor, TipoPendencia).
Escopo, riscos e ordem de construção
O maior risco agora é o escopo: ponto e cálculo de folha são, cada um, um sistema inteiro. Construam primeiro o fluxo do atestado de ponta a ponta e só depois o ponto e a folha simplificados.
Ordem sugerida
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
Riscos e como evitar
Risco
Como evitar
O cálculo da folha ficar grande demais
Só salário, HE, faltas, INSS, IRRF e VT; chamar de “prévia”
O ponto virar um sistema à parte
Só entrada e saída; o que faltar vira pendência
Front e back saírem fora de sincronia
Combinar os DTOs e enums no primeiro dia; usar dados fictícios no front até o back ficar pronto
Segurança só no front
Toda regra de permissão validada no Spring Security
Demo falhar ao vivo
Dados de exemplo fixos e um botão “resetar demo”