# 🔄 Mapeamento da Nova API Imobzi

## 📊 Informações Gerais

- **URL Base Nova**: `https://api.imobzi.app` (antes: `https://api.imobzi.com`)
- **Total de Endpoints**: 300
- **Data de Extração**: 2025-12-09
- **Categorias**: 80+

## 🔄 Mudanças Principais

### 1. URL Base
- ❌ Antiga: `https://api.imobzi.com`
- ✅ Nova: `https://api.imobzi.app`

### 2. Endpoint de Teste
- ❌ Antigo: `/v1/account` (não existe mais)
- ✅ Novo: `/v1/users` ou `/v1/parameters`

## 📋 Mapeamento de Recursos

### Recursos que Mudaram de Nome/Caminho

| Recurso Antigo | Endpoint Antigo | Endpoint Novo | Status |
|----------------|-----------------|---------------|--------|
| Account | `/v1/account` | `/v1/users` ou `/v1/parameters` | ⚠️ Mudou |
| Lead | `/v1/leads` | `/v1/contacts` ou `/v1/persons` | ⚠️ Mudou |
| Property | `/v1/properties` | `/v1/properties` | ✅ Mantido |
| Contact | `/v1/contacts` | `/v1/contacts` | ✅ Mantido |
| Contrato | `/v1/contracts` | `/v1/contracts` | ✅ Mantido |
| Financeiro | `/v1/financial/accounts` | `/v1/financial/accounts` | ✅ Mantido |
| Locacao | `/v1/rentals` | `/v1/leases` | ⚠️ Mudou |
| Documento | `/v1/documents` | `/v1/documents` | ✅ Mantido |
| Tarefa | `/v1/tasks` | Não encontrado diretamente | ⚠️ Verificar |
| Agenda | `/v1/agendas` | `/v1/calendar` | ⚠️ Mudou |
| Evento | `/v1/events` | `/v1/calendar` | ⚠️ Mudou |
| Integracao | `/v1/integrations` | `/v1/integrations` | ✅ Mantido |
| Usuario | `/v1/users` | `/v1/users` | ✅ Mantido |

### Novos Recursos Disponíveis

1. **Deals** (`/v1/deals`) - Negócios/Oportunidades
2. **Pipeline** (`/v1/pipelines`) - Funis de vendas
3. **Property Types** (`/v1/property-types`) - Tipos de imóveis
4. **Property Features** (`/v1/property-features`) - Características de imóveis
5. **Neighborhoods** (`/v1/neighborhoods`) - Bairros
6. **Media Sources** (`/v1/media-sources`) - Fontes de mídia
7. **Contacts Tags** (`/v1/contacts/tags`) - Tags de contatos
8. **Webhooks** (`/v1/webhooks`) - Gerenciamento de webhooks
9. **Teams** (`/v1/user-teams`) - Equipes
10. **Invoices** (`/v1/invoices`) - Faturas
11. **Financial Transactions** (`/v1/financial/transactions`) - Transações financeiras
12. **Lease** (`/v1/leases`) - Locações (novo nome)
13. **Nota Fiscal** (`/v1/notas-fiscais`) - Notas fiscais
14. **Timelines** (`/v1/timeline`) - Linha do tempo
15. **Revisions** (`/v1/revision`) - Revisões/Backups
16. **Notifications** (`/v1/notifications`) - Notificações
17. **Credit Financing Analysis** (`/v1/cf-analysis`) - Análise de financiamento
18. **Site Highlights** (`/v1/adverts/site-highlights`) - Destaques do site

## 🔍 Endpoints Importantes por Categoria

### Contacts and Leads (20 endpoints)
- `GET /v1/contacts` - Listar contatos
- `GET /v1/contacts/search` - Buscar contatos
- `POST /v1/persons` - Criar pessoa/contato
- `GET /v1/contact/{contact_id}` - Obter contato específico
- `PUT /v1/contact/{contact_id}` - Atualizar contato
- `DELETE /v1/contact/{contact_id}` - Deletar contato

### Property (21 endpoints)
- `GET /v1/properties` - Listar imóveis
- `POST /v1/properties` - Criar imóvel
- `GET /v1/property/{property_id}` - Obter imóvel específico
- `PUT /v1/property/{property_id}` - Atualizar imóvel
- `DELETE /v1/property/{property_id}` - Deletar imóvel
- `POST /v1/properties/{property_id}/photos` - Adicionar foto
- `GET /v1/property/{property_id}/calendar-items` - Calendário do imóvel

### Contracts (7 endpoints)
- `GET /v1/contracts` - Listar contratos
- `POST /v1/contracts` - Criar contrato
- `GET /v1/contract/{contract_id}` - Obter contrato específico
- `GET /v1/contract/code/{contract_code}` - Obter por código

### Financial (múltiplas categorias)
- `GET /v1/financial/accounts` - Contas financeiras
- `GET /v1/financial/transactions` - Transações
- `GET /v1/financial/categories` - Categorias financeiras
- `GET /v1/invoices` - Faturas
- `GET /v1/financial/landlord/accounts` - Contas de proprietários

### Lease (6 endpoints)
- `GET /v1/leases` - Listar locações
- `POST /v1/leases` - Criar locação
- `GET /v1/lease/{lease_id}` - Obter locação específica
- `POST /v1/lease/calculate` - Calcular locação
- `POST /v1/lease/agreement` - Gerar acordo de locação

### Calendar (5 endpoints)
- `GET /v1/calendar` - Listar eventos/agenda
- `POST /v1/calendar` - Criar evento
- `GET /v1/calendar-item/{calendar_id}` - Obter evento específico
- `DELETE /v1/calendar-item/{calendar_id}` - Deletar evento

### Users (9 endpoints)
- `GET /v1/users` - Listar usuários
- `POST /v1/users` - Criar usuário
- `GET /v1/user/profile` - Perfil do usuário
- `GET /v1/users/ranking` - Ranking de usuários

### Webhooks (5 endpoints)
- `GET /v1/webhooks` - Listar webhooks
- `POST /v1/webhooks` - Criar webhook
- `GET /v1/webhook/{webhook_id}` - Obter webhook específico
- `DELETE /v1/webhook/{webhook_id}` - Deletar webhook

## 📝 Observações Importantes

1. **Paginação**: A nova API usa `cursor` ao invés de `limit/offset` em muitos endpoints
2. **Leads**: Agora são tratados como parte de Contacts/Persons
3. **Locations**: Mudou de `rentals` para `leases`
4. **Calendar**: Unificou agendas e eventos em `/v1/calendar`
5. **Muitos novos recursos**: A API expandiu significativamente

## 🎯 Próximos Passos

1. ✅ Atualizar URL base nas credenciais
2. ⏳ Atualizar mapeamento de recursos no node principal
3. ⏳ Adicionar novos recursos disponíveis
4. ⏳ Atualizar filtros e parâmetros conforme nova API
5. ⏳ Atualizar documentação


