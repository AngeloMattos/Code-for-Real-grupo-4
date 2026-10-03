# Fecha Comigo

Protótipo web em português do Brasil para acompanhar pendências entre funcionário, RH e contabilidade até o fechamento da folha. React + TypeScript + Vite + Tailwind CSS, com ícones Lucide.

## Executar

Requer Node.js 22.18 ou superior (validado com Node 24), npm e um navegador.

```sh
npm install
npm run dev
```

Abra http://127.0.0.1:5173. Para gerar a versão de apresentação: `npm run build`. Para servi-la: `npm run preview`.

## Telas

- Visão geral da contabilidade, do RH e da Marina, com indicadores derivados.
- Central de pendências com pesquisa, filtros combináveis, ordenação e detalhes em painel lateral.
- Fechamento com seis etapas, prazos, datas realizadas e bloqueio dinâmico.
- Empresas e seus detalhes; funcionários pesquisáveis e seus perfis.
- Inbox de mensagens, central de alertas e holerites com comparação por competência.

O seletor **Trocar perfil** é um recurso de demonstração, sem autenticação. A visão funcionário mostra apenas Marina; o RH acompanha a empresa selecionada; a contabilidade acompanha as quatro empresas fornecidas.

## Roteiro de apresentação

Abra **Modo demonstração** na barra lateral:

1. **Marina:** P001 → P002 → P001. Consulte o histórico, adicione uma resposta, abra o resumo e compare os holerites de agosto e setembro. A diferença do líquido é −R$ 128,80.
2. **Clínica:** na visão RH da clínica, abra **Resolver bloqueio** → **Confirmar horas** → **Confirmar resolução**. A P019 é resolvida e o processamento volta a aparecer em andamento. A folha não é marcada como concluída. Reabrir a P019 restaura o bloqueio.
3. **Malharia:** na visão RH, priorize os bloqueadores e os prazos de 22/10. A P015 mostra Lucas → Ana Paula / RH → Carlos / Contabilidade. Use os botões de encaminhamento e consulte a mudança de responsável no histórico.

Para abrir uma solicitação nova, selecione Funcionário e clique em **Nova solicitação**. O registro recebe um ID `TEMP-*` e aparece na lista.

## Dados e simulação

- Única fonte de dados de negócio: `src/data/fecha-comigo.json`, cópia integral do JSON fornecido. `dados-originais/` preserva os arquivos extraídos do ZIP.
- Referência fixa: **20/10/2026**, competência **10/2026**. Nenhuma urgência usa a data real do computador.
- Sem backend, banco, login, serviços externos, API de IA ou integração real com SCI.
- O estado começa como cópia em memória. Mensagens, alterações de status, encaminhamentos, confirmações e novas solicitações são descartados ao recarregar. Não usa localStorage nem modifica o JSON original.
- Mensagens acrescentadas pelos botões de ação são identificadas como **[Simulação]**. Respostas digitadas representam a ação do usuário na apresentação.
- Holerites e descontos são fictícios. A comparação apenas subtrai os valores existentes; não calcula folha ou obrigações trabalhistas.
- Há 4 empresas, 36 funcionários, 30 pendências, 8 fechamentos e 4 holerites. Inicialmente: 26 pendências abertas, 9 bloqueadores e 1 fechamento bloqueado. A Malharia informa 40 funcionários, com 13 na amostra.
- O resumo de conversa é determinístico. Alertas de atividade parada indicam dias sem registro, sem presumir que todas as conversas estavam aguardando resposta.

## Organização

- `src/contexts/AppContext.tsx`: estado da demonstração e atualização das pendências.
- `src/lib/domain.ts`: regras de urgência, responsáveis, escopo de persona, fechamento e formatação.
- `src/types/index.ts`: tipos do dataset.
- `src/components/`: componentes compartilhados, painel de pendência, formulários e modo demonstração.
- `src/pages/`: as oito áreas do produto.
- `src/styles.css`: tema, layout, responsividade e estados visuais.
- `tests/domain.test.ts`: integridade dos dados e regras de negócio.
- `tests/e2e/flows.spec.ts`: navegação e fluxos reais no navegador.

## Verificar

```sh
npm test
npm run test:e2e
npm run build
```

Os testes de navegador usam o Microsoft Edge instalado, em modo headless e perfil temporário. Mantenha `npm run dev` aberto antes de executá-los. Para usar outro navegador, ajuste `channel` em `playwright.config.ts`.

A interface tem foco visível, labels, diálogo nativo com Escape e contenção de foco, navegação mobile em drawer, listas em cards no celular, timeline vertical e suporte à preferência por movimento reduzido.
