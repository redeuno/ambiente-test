# n8n-nodes-imobzi

Este é um pacote de nodes da comunidade n8n que permite integrar com a API da Imobzi em seus workflows.

A Imobzi é uma plataforma de CRM imobiliário que oferece uma API aberta para integração com outros softwares. Para utilizar a API, é necessário possuir o plano CRM Business ou a Gestão de Locação Real Estate.

[n8n](https://n8n.io/) é uma plataforma de automação de workflows com licença fair-code.

[Instalação](#instalação)  
[Configuração](#configuração)  
[Recursos](#recursos)  
[Operações](#operações)  
[Webhooks](#webhooks)  
[Exemplos](#exemplos)  
[Compatibilidade](#compatibilidade)  
[Recursos](#recursos-1)  

## Instalação

Siga o [guia de instalação](https://docs.n8n.io/integrations/community-nodes/installation/) na documentação dos nodes da comunidade n8n.

```bash
npm install -g @mantovani.bruno/n8n-nodes-imobzi-new
```

Ou instale direto pela interface do n8n (Settings → Community Nodes → Install):
```
@mantovani.bruno/n8n-nodes-imobzi-new
```

## Configuração

### 1. Gerar Chave de API no Imobzi

1. Acesse o menu lateral do Imobzi
2. Clique em **"Integrações & Automações"**
3. Selecione **"Chave de API"**
4. Clique em **"Adicionar uma nova chave de API"**
5. Nomeie a chave conforme o serviço que irá utilizá-la
6. Copie a chave gerada

Para mais detalhes, consulte: [Como funciona a chave de API](https://help.imobzi.com/pt-br/article/como-funciona-a-chave-de-api-1nieky8/)

### 2. Configurar Permissões da Chave de API

1. Ao criar ou editar uma chave de API, defina exatamente quais métodos (funções) a integração poderá acessar
2. Marque os métodos desejados ou utilize a opção **"Selecionar todos os métodos"** para liberar todas as funções

### 3. Configurar Credenciais no n8n

1. No n8n, vá para **Settings** > **Credentials**
2. Clique em **Add Credential**
3. Procure por **"Imobzi API"**
4. Configure:
   - **API Key**: Cole a chave gerada no Imobzi

## Recursos

O node suporta os seguintes recursos da API da Imobzi (atualizado para nova API `api.imobzi.app`):

### Recursos Principais

| Recurso | Endpoint | Descrição |
|---------|----------|-----------|
| **Account** | `/v1/users` | Informações da conta (agora via users) |
| **Leads** | `/v1/contacts` | Gerenciamento de leads (parte de contacts) |
| **Properties** | `/v1/properties` | Gerenciamento de imóveis |
| **Contacts** | `/v1/contacts` | Gerenciamento de contatos |
| **Contracts** | `/v1/contracts` | Gerenciamento de contratos |
| **Financial** | `/v1/financial/accounts` | Contas financeiras |
| **Leases** | `/v1/leases` | Gerenciamento de locações (antes rentals) |
| **Documents** | `/v1/documents` | Gerenciamento de documentos |
| **Calendar** | `/v1/calendar` | Agenda e eventos (unificado) |
| **Integrations** | `/v1/integrations` | Integrações configuradas |
| **Users** | `/v1/users` | Gerenciamento de usuários |

### Novos Recursos Disponíveis

| Recurso | Endpoint | Descrição |
|---------|----------|-----------|
| **Deal** | `/v1/deals` | Negócios e oportunidades |
| **Pipeline** | `/v1/pipelines` | Funis de vendas |
| **Invoice** | `/v1/invoices` | Faturas |
| **Transaction** | `/v1/financial/transactions` | Transações financeiras |
| **Webhook** | `/v1/webhooks` | Gerenciamento de webhooks |
| **Team** | `/v1/user-teams` | Equipes |
| **Neighborhood** | `/v1/neighborhoods` | Bairros |
| **Property Type** | `/v1/property-types` | Tipos de imóveis |
| **Property Feature** | `/v1/property-features` | Características de imóveis |
| **Media Source** | `/v1/media-sources` | Fontes de mídia |
| **Nota Fiscal** | `/v1/notas-fiscais` | Notas fiscais |
| **Timeline** | `/v1/timeline` | Linha do tempo |
| **Notification** | `/v1/notifications` | Notificações |

> **Nota**: Esta versão (1.0.0+) usa a nova API da Imobzi (`api.imobzi.app`) com suporte a 300+ endpoints.

## Operações

Cada recurso suporta as seguintes operações:

### Create
Cria um novo item no recurso selecionado.

**Campos específicos por recurso:**

#### Leads
- `name` - Nome do lead
- `email` - Email do lead
- `phone` - Telefone do lead
- `description` - Descrição do lead
- `source` - Origem do lead
- `status` - Status do lead

#### Properties
- `title` - Título do imóvel
- `type` - Tipo do imóvel (casa, apartamento, etc.)
- `price` - Preço do imóvel
- `address` - Endereço do imóvel
- `city` - Cidade do imóvel
- `state` - Estado do imóvel

#### Contacts
- `name` - Nome do contato
- `email` - Email do contato
- `phone` - Telefone do contato
- `description` - Descrição do contato
- `company` - Empresa do contato

#### Tasks
- `title` - Título da tarefa
- `description` - Descrição da tarefa
- `dueDate` - Data de vencimento
- `priority` - Prioridade da tarefa

#### Events
- `title` - Título do evento
- `description` - Descrição do evento
- `startDate` - Data de início
- `endDate` - Data de término

### Get
Obtém um item específico. Suporta busca por:
- **ID**: Busca pelo ID numérico (padrão)
- **Código**: Busca pelo código do item
- **Email**: Busca por email (Contacts/Leads)
- **Telefone**: Busca por telefone (Contacts/Leads)
- **CPF**: Busca por CPF (Contacts/Leads)
- **Nome**: Busca por nome (retorna primeiro resultado)

**Exemplo - Buscar Contato por Email:**
```
Recurso: Contact
Operação: Get
Buscar por: Email
Valor: joao@exemplo.com
```

### Get All
Lista todos os itens do recurso com suporte a:
- **Busca Rápida**: Campos específicos (Email, Telefone, CPF, Nome) para Contacts/Leads
- **Filtros Avançados**: Baseados nos campos reais da API
- **Operadores**: igual, diferente, maior que, menor que, contém, etc.
- **Ordenação**: Por campo específico
- **Paginação**: Limit e offset

**Exemplo - Listar Leads por Telefone:**
```
Recurso: Lead
Operação: Get All
Busca Rápida:
  Telefone: (11) 99999-9999
```

### Update
Atualiza um item existente por ID.

### Delete
Remove um item por ID.

## Webhooks

O node webhook permite receber notificações em tempo real sobre eventos específicos no Imobzi.

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

### Configuração de Webhooks

Para configurar webhooks na Imobzi:

1. Acesse o painel da Imobzi
2. Vá para **Configurações** > **Webhooks**
3. Adicione uma nova URL de webhook
4. Selecione os eventos que devem acionar o webhook

Para um guia completo, consulte: [Como criar e usar webhooks na Imobzi](https://www.imobzi.com/docs/primeiros-passos/integracoes-e-automacoes/como-criar-e-usar-webhooks-na-imobzi/)

## Exemplos

### Exemplo 1: Criar Lead Automaticamente

1. Adicione o **Imobzi Webhook** como trigger
2. Configure para eventos de "Lead Criado"
3. Conecte com o **Imobzi Node**
4. Configure para criar um contato baseado no lead

### Exemplo 2: Sincronizar Imóveis

1. Use um **Cron** ou **Schedule** trigger
2. Conecte com **Imobzi Node** (Get All Properties)
3. Processe os dados conforme necessário

### Exemplo 3: Filtrar Imóveis por Preço

```json
{
  "resource": "property",
  "operation": "getAll",
  "filters": {
    "filter": [
      {
        "field": "price",
        "operator": "gte",
        "value": "100000"
      }
    ]
  }
}
```

## Compatibilidade

- **n8n**: Versão mínima 1.0.0
- **Node.js**: >=20.15
- **Plano Imobzi**: CRM Business ou Gestão de Locação Real Estate

## Recursos e Links

* [Repositório GitHub](https://github.com/redeuno/imobzi-new)
* [Pacote npm](https://www.npmjs.com/package/@mantovani.bruno/n8n-nodes-imobzi-new)
* [Documentação da comunidade n8n](https://docs.n8n.io/integrations/#community-nodes)
* [Documentação da API Imobzi](https://developer.imobzi.com/)
* [Como funciona a chave de API](https://help.imobzi.com/pt-br/article/como-funciona-a-chave-de-api-1nieky8/)
* [Como utilizar a API para integrar com aplicativos externos](https://help.imobzi.com/pt-br/article/como-utilizar-a-api-para-integrar-com-aplicativos-externos-n4fbe7/)
* [Como criar e usar webhooks na Imobzi](https://www.imobzi.com/docs/primeiros-passos/integracoes-e-automacoes/como-criar-e-usar-webhooks-na-imobzi/)

## Histórico de Versões

### v1.0.0 (Atual)
- 🎉 **Atualização Major**: Nova API Imobzi (`api.imobzi.app`)
- ✅ URL base atualizada: `api.imobzi.com` → `api.imobzi.app`
- ✅ 15+ novos recursos adicionados
- ✅ Suporte a 300+ endpoints da API
- ✅ Recursos atualizados conforme nova estrutura
- ✅ Endpoint de teste atualizado (`/v1/users`)
- ⚠️ **Breaking Changes**: Alguns recursos mudaram de endpoint (ver CHANGELOG.md)

### v0.3.48
- Versão anterior com API antiga

### v0.3.47
- ✅ Endpoints corrigidos para usar `/v1/` conforme documentação oficial
- ✅ URL base corrigida para `https://api.imobzi.com`
- ✅ Autenticação Bearer Token implementada
- ✅ Campos específicos por recurso implementados
- ✅ Webhooks com eventos oficiais da API
- ✅ Filtros dinâmicos funcionais
- ✅ Todos os erros de linting corrigidos

---

**Criado por**: Bruno Mantovani  
**Versão Atual**: 1.0.1  
**Última atualização**: Dezembro 2025  
**API Base**: `https://api.imobzi.app`  
**Repositório**: https://github.com/redeuno/imobzi-new
