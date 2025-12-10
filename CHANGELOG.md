# Changelog

## [1.2.4] - 2025-12-10

### 🐛 Correções de Bugs Críticos

#### Imobzi.node.ts
- ✅ **URLs de busca por código corrigidas**: Adicionada URL base `https://api.imobzi.app` que estava faltando nas buscas por código
- ✅ **Endpoints de busca por código atualizados** para nova estrutura da API:
  - Lead: `/v1/contacts/code/{code}`
  - Contact: `/v1/contacts/code/{code}`
  - Property: `/v1/properties/code/{code}`
  - Contract: `/v1/contracts/code/{code}`
  - Lease: `/v1/leases/code/{code}`
- ✅ **Load Options corrigidos** - Endpoints atualizados para consistência com a nova API:
  - `getLeads`: `v1/leads` → `v1/contacts`
  - `getRentals`: `v1/rentals` → `v1/leases`
  - `getTasks`: `v1/tasks` → `v1/timeline`
  - `getAgendas`: `v1/agendas` → `v1/calendar`
  - `getEvents`: `v1/events` → `v1/calendar`

#### ImobziWebhook.node.ts
- ✅ **Import corrigido**: Adicionado `NodeConnectionType` ao import
- ✅ **Outputs corrigido**: Removido cast incorreto, agora usa `NodeConnectionType.Main`

### Impacto
Estas correções resolvem erros de execução que ocorriam ao:
- Buscar recursos por código
- Carregar opções nos dropdowns do node
- Utilizar o webhook trigger

---

## [1.0.1] - 2025-12-10

### Atualizações
- ✅ Repositório atualizado para https://github.com/redeuno/imobzi-new
- ✅ Informações do autor atualizadas
- ✅ Links de instalação corrigidos

---

## [1.0.0] - 2025-01-XX

### 🎉 Atualização Major - Nova API Imobzi

#### Mudanças Principais

- ✅ **URL Base Atualizada**: `https://api.imobzi.com` → `https://api.imobzi.app`
- ✅ **Endpoint de Teste**: `/v1/account` → `/v1/users`
- ✅ **Novos Recursos Adicionados**: 15+ novos recursos da API
- ✅ **Recursos Atualizados**: Mapeamento corrigido para nova estrutura
- ✅ **Busca Avançada**: Busca por ID, Código, Email, Telefone, CPF e Nome

#### Novos Recursos

- **Deal** (`/v1/deals`) - Negócios e oportunidades
- **Pipeline** (`/v1/pipelines`) - Funis de vendas
- **Invoice** (`/v1/invoices`) - Faturas
- **Transaction** (`/v1/financial/transactions`) - Transações financeiras
- **Webhook** (`/v1/webhooks`) - Gerenciamento de webhooks
- **Team** (`/v1/user-teams`) - Equipes
- **Neighborhood** (`/v1/neighborhoods`) - Bairros
- **Property Type** (`/v1/property-types`) - Tipos de imóveis
- **Property Feature** (`/v1/property-features`) - Características de imóveis
- **Media Source** (`/v1/media-sources`) - Fontes de mídia
- **Nota Fiscal** (`/v1/notas-fiscais`) - Notas fiscais
- **Timeline** (`/v1/timeline`) - Linha do tempo
- **Notification** (`/v1/notifications`) - Notificações

#### Recursos Atualizados

- **Lead**: Agora usa `/v1/contacts` (leads são parte de contacts)
- **Locacao**: Mudou de `/v1/rentals` para `/v1/leases`
- **Agenda**: Mudou de `/v1/agendas` para `/v1/calendar`
- **Evento**: Mudou de `/v1/events` para `/v1/calendar`
- **Tarefa**: Mudou de `/v1/tasks` para `/v1/timeline`
- **Account**: Mudou de `/v1/account` para `/v1/users`

#### Melhorias

- ✅ Atualização completa para nova estrutura da API
- ✅ Suporte a 300 endpoints da API Imobzi
- ✅ Mapeamento correto de recursos antigos para novos
- ✅ **Busca Avançada Implementada**:
  - Contacts/Leads: Busca por ID, Código, Email, Telefone, CPF, Nome
  - Properties: Busca por ID, Código, Nome/Título
  - Contracts: Busca por ID, Código
  - Leases: Busca por ID, Código
- ✅ Busca Rápida no Get All para filtros comuns
- ✅ Documentação atualizada

#### Breaking Changes

⚠️ **ATENÇÃO**: Esta é uma atualização major com breaking changes:

1. URL base mudou de `api.imobzi.com` para `api.imobzi.app`
2. Alguns recursos mudaram de endpoint (ver seção "Recursos Atualizados")
3. Alguns recursos foram consolidados (ex: Agenda e Evento agora são Calendar)

#### Migração

Para migrar da versão anterior:

1. Atualize suas credenciais no n8n (a URL base será atualizada automaticamente)
2. Verifique workflows que usam recursos que mudaram de endpoint
3. Atualize referências de recursos antigos para novos

---

## [0.3.48] - Versão Anterior

Versão anterior com API antiga (`api.imobzi.com`).

