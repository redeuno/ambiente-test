# Implementação da API da Imobzi

Este documento descreve a implementação técnica da integração com a API da Imobzi no n8n.

## Configuração Oficial da API

### Pré-requisitos
- **Plano Imobzi**: CRM Business ou Gestão de Locação Real Estate
- **Chave de API**: Gerada no painel da Imobzi
- **Permissões**: Configuradas para os métodos necessários

### Geração da Chave de API
1. Acesse o menu lateral do Imobzi
2. Clique em **"Integrações & Automações"**
3. Selecione **"Chave de API"**
4. Clique em **"Adicionar uma nova chave de API"**
5. Nomeie a chave conforme o serviço que irá utilizá-la
6. Copie a chave gerada

**Documentação oficial**: [Como funciona a chave de API](https://help.imobzi.com/pt-br/article/como-funciona-a-chave-de-api-1nieky8/)

### Configuração das Permissões
- Ao criar ou editar uma chave de API, defina exatamente quais métodos (funções) a integração poderá acessar
- Marque os métodos desejados ou utilize a opção **"Selecionar todos os métodos"** para liberar todas as funções

## Endpoints da API

### Base URLs
- **Production**: `https://api.imobzi.com`
- **Versionamento**: Todos os endpoints usam `/v1/`

### Autenticação
A API usa autenticação via Bearer Token:
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## Endpoints Implementados

### Account
- **GET** `/v1/account` - Obtém informações da conta

### Leads
- **GET** `/v1/leads` - Lista todos os leads
- **GET** `/v1/leads/{id}` - Obtém um lead específico
- **POST** `/v1/leads` - Cria um novo lead
- **PUT** `/v1/leads/{id}` - Atualiza um lead

**Campos suportados**:
- `name` - Nome do lead
- `email` - Email do lead
- `phone` - Telefone do lead
- `description` - Descrição do lead
- `source` - Origem do lead
- `status` - Status do lead

### Properties
- **GET** `/v1/properties` - Lista todos os imóveis
- **GET** `/v1/properties/{id}` - Obtém um imóvel específico
- **POST** `/v1/properties` - Cria um novo imóvel
- **PUT** `/v1/properties/{id}` - Atualiza um imóvel

**Campos suportados**:
- `title` - Título do imóvel
- `type` - Tipo do imóvel (casa, apartamento, etc.)
- `price` - Preço do imóvel
- `address` - Endereço do imóvel
- `city` - Cidade do imóvel
- `state` - Estado do imóvel

### Contacts
- **GET** `/v1/contacts` - Lista todos os contatos
- **GET** `/v1/contacts/{id}` - Obtém um contato específico
- **POST** `/v1/contacts` - Cria um novo contato
- **PUT** `/v1/contacts/{id}` - Atualiza um contato

**Campos suportados**:
- `name` - Nome do contato
- `email` - Email do contato
- `phone` - Telefone do contato
- `description` - Descrição do contato
- `company` - Empresa do contato

### Contracts
- **GET** `/v1/contracts` - Lista todos os contratos
- **GET** `/v1/contracts/{id}` - Obtém um contrato específico
- **POST** `/v1/contracts` - Cria um novo contrato
- **PUT** `/v1/contracts/{id}` - Atualiza um contrato

### Financial Accounts
- **GET** `/v1/financial/accounts` - Lista todas as contas financeiras
- **GET** `/v1/financial/accounts/{id}` - Obtém uma conta específica
- **POST** `/v1/financial/accounts` - Cria uma nova conta
- **PUT** `/v1/financial/accounts/{id}` - Atualiza uma conta

### Rentals
- **GET** `/v1/rentals` - Lista todas as locações
- **GET** `/v1/rentals/{id}` - Obtém uma locação específica
- **POST** `/v1/rentals` - Cria uma nova locação
- **PUT** `/v1/rentals/{id}` - Atualiza uma locação

### Documents
- **GET** `/v1/documents` - Lista todos os documentos
- **GET** `/v1/documents/{id}` - Obtém um documento específico
- **POST** `/v1/documents` - Cria um novo documento
- **PUT** `/v1/documents/{id}` - Atualiza um documento

### Tasks
- **GET** `/v1/tasks` - Lista todas as tarefas
- **GET** `/v1/tasks/{id}` - Obtém uma tarefa específica
- **POST** `/v1/tasks` - Cria uma nova tarefa
- **PUT** `/v1/tasks/{id}` - Atualiza uma tarefa

**Campos suportados**:
- `title` - Título da tarefa
- `description` - Descrição da tarefa
- `dueDate` - Data de vencimento
- `priority` - Prioridade da tarefa

### Agendas
- **GET** `/v1/agendas` - Lista todas as agendas
- **GET** `/v1/agendas/{id}` - Obtém uma agenda específica
- **POST** `/v1/agendas` - Cria uma nova agenda
- **PUT** `/v1/agendas/{id}` - Atualiza uma agenda

**Campos suportados**:
- `title` - Título da agenda
- `description` - Descrição da agenda

### Events
- **GET** `/v1/events` - Lista todos os eventos
- **GET** `/v1/events/{id}` - Obtém um evento específico
- **POST** `/v1/events` - Cria um novo evento
- **PUT** `/v1/events/{id}` - Atualiza um evento

**Campos suportados**:
- `title` - Título do evento
- `description` - Descrição do evento
- `startDate` - Data de início
- `endDate` - Data de término

### Integrations
- **GET** `/v1/integrations` - Lista todas as integrações
- **GET** `/v1/integrations/{id}` - Obtém uma integração específica
- **POST** `/v1/integrations` - Cria uma nova integração
- **PUT** `/v1/integrations/{id}` - Atualiza uma integração

### Users
- **GET** `/v1/users` - Lista todos os usuários
- **GET** `/v1/users/{id}` - Obtém um usuário específico
- **POST** `/v1/users` - Cria um novo usuário
- **PUT** `/v1/users/{id}` - Atualiza um usuário

## Filtros Dinâmicos

### Operadores Suportados
- `eq` - Igual
- `neq` - Diferente
- `gt` - Maior que
- `lt` - Menor que
- `gte` - Maior ou igual
- `lte` - Menor ou igual
- `contains` - Contém
- `not_contains` - Não contém
- `starts_with` - Começa com
- `ends_with` - Termina com

### Formato dos Filtros
```
GET /v1/properties?title__contains=casa&price__gte=100000
```

## Webhooks

### Eventos Suportados
- `lead.created` - Lead criado
- `lead.updated` - Lead atualizado
- `property.created` - Imóvel criado
- `property.updated` - Imóvel atualizado
- `contact.created` - Contato criado
- `contact.updated` - Contato atualizado
- `visit.scheduled` - Visita agendada
- `visit.cancelled` - Visita cancelada
- `task.created` - Tarefa criada
- `task.updated` - Tarefa atualizada
- `event.created` - Evento criado
- `event.updated` - Evento atualizado
- `contract.created` - Contrato criado
- `contract.updated` - Contrato atualizado
- `document.created` - Documento criado
- `document.updated` - Documento atualizado

### Formato do Webhook
```json
{
  "event": "lead.created",
  "timestamp": "2024-01-01T10:00:00Z",
  "data": {
    "id": "lead_123",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "+5511999999999",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### Configuração de Webhooks
Para configurar webhooks na Imobzi:

1. Acesse o painel da Imobzi
2. Vá para **Configurações** > **Webhooks**
3. Adicione uma nova URL de webhook
4. Selecione os eventos que devem acionar o webhook

**Documentação oficial**: [Como criar e usar webhooks na Imobzi](https://www.imobzi.com/docs/primeiros-passos/integracoes-e-automacoes/como-criar-e-usar-webhooks-na-imobzi/)

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Rate Limiting

A API da Imobzi possui limites de requisições:
- **Free Plan**: 100 requests/hour
- **Pro Plan**: 1000 requests/hour
- **Enterprise Plan**: 10000 requests/hour

## Implementação no Node

### Autenticação
```typescript
authenticate: IAuthenticateGeneric = {
  type: 'generic',
  properties: {
    headers: {
      Authorization: '=Bearer {{$credentials.apiKey}}',
      'Content-Type': 'application/json',
    },
  },
};
```

### Exemplo de Request
```typescript
const response = await this.helpers.requestWithAuthentication.call(
  this,
  'imobziApi',
  {
    method: 'GET',
    url: '/v1/leads',
    qs: { limit: 10, offset: 0 }
  }
);
```

### Filtros Dinâmicos
```typescript
const buildQueryFromFilters = (filters: IDataObject): IDataObject => {
  const query: IDataObject = {};
  
  if (filters && filters.filter && Array.isArray(filters.filter)) {
    filters.filter.forEach((filter: any) => {
      if (filter.field && filter.operator && filter.value !== undefined) {
        const filterKey = `${filter.field}__${filter.operator}`;
        query[filterKey] = filter.value;
      }
    });
  }
  
  return query;
};
```

## Testes

Para testar a integração:

1. Use o ambiente Sandbox para testes
2. Crie dados de teste
3. Verifique se as respostas estão corretas
4. Teste cenários de erro
5. Valide o formato dos dados

## Suporte

Para suporte técnico da API da Imobzi:
- **Documentação**: https://developer.imobzi.com/
- **Status**: https://status.imobzi.com/
- **Email**: api@imobzi.com

## Recursos Adicionais

- [Como funciona a chave de API](https://help.imobzi.com/pt-br/article/como-funciona-a-chave-de-api-1nieky8/)
- [Como utilizar a API para integrar com aplicativos externos](https://help.imobzi.com/pt-br/article/como-utilizar-a-api-para-integrar-com-aplicativos-externos-n4fbe7/)
- [Como criar e usar webhooks na Imobzi](https://www.imobzi.com/docs/primeiros-passos/integracoes-e-automacoes/como-criar-e-usar-webhooks-na-imobzi/)

---

**Versão**: 0.3.47  
**Última atualização**: Janeiro 2024 