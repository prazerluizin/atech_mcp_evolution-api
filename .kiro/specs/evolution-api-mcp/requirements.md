# Requirements Document

## Introduction

Este documento define os requisitos para criar um servidor MCP (Model Context Protocol) para a Evolution API que pode ser executado via npx. O servidor permitirá que desenvolvedores integrem facilmente a Evolution API em seus projetos através do protocolo MCP, utilizando o Context7 MCP para descoberta de endpoints e HTTP requests para comunicação com a API.

## Requirements

### Requirement 1

**User Story:** Como um desenvolvedor, eu quero executar o MCP da Evolution API via npx, para que eu possa usar a funcionalidade sem instalação complexa.

#### Acceptance Criteria

1. WHEN o usuário executa `npx evolution-api-mcp` THEN o sistema SHALL inicializar o servidor MCP
2. WHEN o servidor é inicializado THEN o sistema SHALL estar pronto para receber conexões MCP
3. WHEN o comando npx é executado sem configuração THEN o sistema SHALL exibir instruções de configuração
4. IF as dependências não estiverem disponíveis THEN o sistema SHALL baixá-las automaticamente

### Requirement 2

**User Story:** Como um desenvolvedor, eu quero configurar a URL da Evolution API e a chave global, para que o MCP possa se conectar à minha instância da Evolution.

#### Acceptance Criteria

1. WHEN o usuário fornece EVOLUTION_URL e EVOLUTION_API_KEY THEN o sistema SHALL validar as credenciais
2. IF a URL não for válida THEN o sistema SHALL retornar erro de configuração
3. IF a API key for inválida THEN o sistema SHALL retornar erro de autenticação
4. WHEN as credenciais são válidas THEN o sistema SHALL estabelecer conexão com a Evolution API
5. WHEN a configuração é alterada THEN o sistema SHALL reconectar automaticamente

### Requirement 3

**User Story:** Como um desenvolvedor, eu quero que o MCP forneça acesso a todos os endpoints da Evolution API v2, para que eu tenha acesso a todas as funcionalidades disponíveis.

#### Acceptance Criteria

1. WHEN o servidor MCP é inicializado THEN o sistema SHALL carregar definições dos endpoints da Evolution API v2
2. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramentas MCP para Instance Controller (criar, conectar, reiniciar, deletar instâncias)
3. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramentas MCP para Message Controller (enviar texto, mídia, áudio, stickers, localização, contatos, reações, polls, listas, botões)
4. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramentas MCP para Chat Controller (buscar mensagens, contatos, chats, marcar como lido, arquivar, verificar WhatsApp, gerenciar presença)
5. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramentas MCP para Group Controller (criar grupos, atualizar configurações, gerenciar participantes, códigos de convite)
6. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramentas MCP para Profile Settings (perfil pessoal, perfil comercial, configurações de privacidade)
7. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramentas MCP para Webhook Management (configurar e buscar webhooks)
8. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramentas MCP para integrações (Chatwoot, Typebot, Flowise, Dify, OpenAI, RabbitMQ, Websocket, SQS)
9. WHEN endpoints são descobertos THEN o sistema SHALL registrar ferramenta MCP para Get Information (informações gerais da API)
10. WHEN o servidor é inicializado THEN o sistema SHALL registrar todas as ferramentas MCP baseadas na documentação v2
11. WHEN novas versões da API são lançadas THEN o sistema SHALL permitir atualizações das definições de endpoints

### Requirement 4

**User Story:** Como um desenvolvedor, eu quero fazer requisições HTTP para a Evolution API v2 através do MCP, para que eu possa executar operações da API de forma integrada.

#### Acceptance Criteria

1. WHEN uma ferramenta MCP é chamada THEN o sistema SHALL fazer uma requisição HTTP correspondente para o endpoint Evolution API v2
2. WHEN requisições são feitas para Instance Controller THEN o sistema SHALL suportar POST, GET, PUT, DELETE conforme especificado na API
3. WHEN requisições são feitas para Message Controller THEN o sistema SHALL suportar envio de texto, mídia, áudio, stickers, localização, contatos, reações, polls, listas e botões
4. WHEN requisições são feitas para Chat Controller THEN o sistema SHALL suportar busca de mensagens, contatos, chats e operações de gerenciamento
5. WHEN requisições são feitas para Group Controller THEN o sistema SHALL suportar criação, atualização e gerenciamento de grupos
6. WHEN requisições são feitas para Profile Settings THEN o sistema SHALL suportar configurações de perfil e privacidade
7. WHEN requisições são feitas para Webhook Management THEN o sistema SHALL suportar configuração e consulta de webhooks
8. WHEN a requisição é bem-sucedida THEN o sistema SHALL retornar os dados da resposta em formato JSON estruturado
9. IF a requisição falhar THEN o sistema SHALL retornar erro detalhado com código de status HTTP
10. WHEN parâmetros são fornecidos THEN o sistema SHALL validá-los conforme especificação da Evolution API v2
11. WHEN headers de autenticação são necessários THEN o sistema SHALL incluir automaticamente a API key global no header 'apikey'

### Requirement 5

**User Story:** Como um desenvolvedor, eu quero que o MCP gerencie automaticamente a autenticação, para que eu não precise me preocupar com tokens e headers.

#### Acceptance Criteria

1. WHEN uma requisição é feita THEN o sistema SHALL incluir automaticamente a API key global
2. IF o token expirar THEN o sistema SHALL renovar automaticamente
3. WHEN múltiplas requisições são feitas THEN o sistema SHALL reutilizar conexões quando possível
4. IF a autenticação falhar THEN o sistema SHALL retornar erro específico de autenticação

### Requirement 6

**User Story:** Como um desenvolvedor, eu quero receber respostas estruturadas e tratamento de erros, para que eu possa integrar facilmente o MCP em meu código.

#### Acceptance Criteria

1. WHEN uma operação é bem-sucedida THEN o sistema SHALL retornar dados em formato JSON estruturado
2. WHEN ocorre um erro THEN o sistema SHALL retornar mensagem de erro clara e código de status
3. IF dados inválidos são enviados THEN o sistema SHALL validar e retornar erro de validação
4. WHEN timeouts ocorrem THEN o sistema SHALL retornar erro de timeout com sugestões
5. WHEN rate limits são atingidos THEN o sistema SHALL retornar erro com tempo de retry

### Requirement 7

**User Story:** Como um desenvolvedor, eu quero que o MCP suporte todas as operações específicas da Evolution API v2, para que eu tenha acesso completo às funcionalidades da plataforma.

#### Acceptance Criteria

1. WHEN ferramentas MCP são chamadas THEN o sistema SHALL suportar parâmetros de instância obrigatórios conforme especificação
2. WHEN operações de grupo são executadas THEN o sistema SHALL suportar groupJid como parâmetro obrigatório
3. WHEN webhooks são configurados THEN o sistema SHALL suportar configuração de eventos específicos (APPLICATION_STARTUP, etc.)
4. WHEN informações da API são solicitadas THEN o sistema SHALL retornar dados do endpoint /get-information
5. WHEN operações de perfil são executadas THEN o sistema SHALL suportar configurações de privacidade e perfil comercial

### Requirement 8

**User Story:** Como um usuário do Claude Desktop, eu quero integrar facilmente o MCP da Evolution API, para que eu possa usar o WhatsApp diretamente através do Claude.

#### Acceptance Criteria

1. WHEN o servidor MCP é executado via npx THEN o sistema SHALL usar STDIO transport para comunicação com Claude Desktop
2. WHEN configurado no Claude Desktop THEN o sistema SHALL aparecer como servidor MCP disponível
3. WHEN ferramentas são chamadas pelo Claude THEN o sistema SHALL retornar respostas em formato otimizado para conversação
4. WHEN erros ocorrem THEN o sistema SHALL fornecer mensagens claras e sugestões de correção para o usuário
5. WHEN o Claude Desktop é reiniciado THEN o sistema SHALL reconectar automaticamente

### Requirement 9

**User Story:** Como um administrador, eu quero configurar o MCP através de variáveis de ambiente ou arquivo de configuração, para que eu possa gerenciar diferentes ambientes facilmente.

#### Acceptance Criteria

1. WHEN variáveis de ambiente são definidas THEN o sistema SHALL usá-las como configuração
2. WHEN um arquivo de configuração existe THEN o sistema SHALL carregá-lo automaticamente
3. IF ambos existem THEN variáveis de ambiente SHALL ter precedência
4. WHEN configuração é inválida THEN o sistema SHALL exibir erro detalhado
5. WHEN configuração muda THEN o sistema SHALL recarregar sem reinicialização completa