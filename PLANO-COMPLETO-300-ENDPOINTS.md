# 🚀 PLANO COMPLETO: IMPLEMENTAÇÃO DOS 300 ENDPOINTS DA API IMOBZI

## 📋 SITUAÇÃO ATUAL

**Versão:** 1.1.0  
**Endpoints Implementados:** ~20 de 300 (7%)  
**Status:** Node compila mas não carrega no n8n (erro de cache/servidor)

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### **FASE 1: CORRIGIR CARREGAMENTO DO NODE** (URGENTE)
**Problema:** "Unrecognized node type" - node não está sendo reconhecido

**Soluções possíveis:**
1. ✅ Limpar cache do servidor n8n (não temos acesso)
2. ✅ Desinstalar/Reinstalar via UI do n8n
3. ⚠️ Verificar se há conflito de versão
4. ⚠️ Reiniciar completamente o servidor n8n

**Ação imediata:**
- Você precisa ter acesso ao servidor ou pedir para quem administra reiniciar o n8n

---

### **FASE 2: REESTRUTURAR PARA 300 ENDPOINTS**

#### **Opção A: Abordagem Modular (RECOMENDADA)**

Criar **nodes separados** para cada categoria principal:

1. **@mantovani.bruno/n8n-nodes-imobzi-contacts** (20 endpoints)
   - Contacts
   - Leads
   - Contact Tags
   - Contact Fields
   
2. **@mantovani.bruno/n8n-nodes-imobzi-properties** (30+ endpoints)
   - Properties
   - Property Types
   - Property Features
   - Property Adverts
   - Property Photos
   - Property Calendar
   - Property Reserves
   
3. **@mantovani.bruno/n8n-nodes-imobzi-deals** (25+ endpoints)
   - Deals
   - Deal Fields
   - Deal Filters
   - Deal Lost Reasons
   - Deal Rotations
   - Pipelines
   - Pipeline Groups
   
4. **@mantovani.bruno/n8n-nodes-imobzi-financial** (25+ endpoints)
   - Accounts
   - Transactions
   - Categories
   - Landlord Accounts
   - Invoices
   - Nota Fiscal
   
5. **@mantovani.bruno/n8n-nodes-imobzi-leases** (15+ endpoints)
   - Leases
   - Lease Fields
   - Lease Insurance
   - Lease Agreement
   - Lease Calculate
   
6. **@mantovani.bruno/n8n-nodes-imobzi-core** (demais)
   - Documents
   - Users
   - Teams
   - Webhooks
   - Integrations
   - Calendar
   - Timeline
   - Notifications

**Vantagens:**
- ✅ Mais fácil de manter
- ✅ Usuário instala apenas o que precisa
- ✅ Mais rápido para carregar
- ✅ Facilita debug

**Desvantagens:**
- ❌ Mais pacotes para publicar
- ❌ Mais complexo inicialmente

#### **Opção B: Node Único com Todos os Endpoints**

Manter um único node mas expandir para 300 endpoints:

**Vantagens:**
- ✅ Um único pacote
- ✅ Instalação simples

**Desvantagens:**
- ❌ Arquivo muito grande (5000+ linhas)
- ❌ Difícil de manter
- ❌ Lento para carregar
- ❌ Complexo para debug

---

## 📊 MAPEAMENTO COMPLETO DOS ENDPOINTS

### **1. CONTACTS & LEADS (20 endpoints)**

#### GET (Leitura)
```
✅ /v1/contacts - Listar contatos
✅ /v1/contacts/search - Buscar contatos
❌ /v1/contacts/profile-picture - Foto de perfil
❌ /v1/contact/exists - Verificar se existe
✅ /v1/persons - Pessoas físicas
❌ /v1/person/{id} - Pessoa por ID
❌ /v1/person/code/{code} - Pessoa por código
✅ /v1/leads - Listar leads
❌ /v1/lead/{id} - Lead por ID
❌ /v1/lead/code/{code} - Lead por código
✅ /v1/organizations - Organizações
❌ /v1/organization/{id} - Organização por ID
❌ /v1/organization/code/{code} - Organização por código
```

#### POST (Criar)
```
❌ /v1/persons - Criar pessoa
❌ /v1/leads - Criar lead
❌ /v1/organizations - Criar organização
❌ /v1/integration/lead - Criar lead via integração
```

#### PUT (Atualizar)
```
❌ /v1/person/{id} - Atualizar pessoa
❌ /v1/lead/{id} - Atualizar lead
❌ /v1/organization/{id} - Atualizar organização
```

#### DELETE (Remover)
```
❌ /v1/lead/{id} - Remover lead
```

---

### **2. PROPERTIES (21 endpoints)**

#### GET
```
✅ /v1/properties - Listar imóveis (166 registros)
❌ /v1/properties/search - Buscar imóveis
❌ /v1/property/{id} - Imóvel por ID
❌ /v1/property/code/{code} - Imóvel por código
❌ /v1/property/{id}/proposal - Propostas do imóvel
❌ /v1/property/{id}/timeline - Timeline do imóvel
❌ /v1/property/{id}/photo - Fotos do imóvel
❌ /v1/property/{id}/photo/{photo_id} - Foto específica
❌ /v1/property/{id}/calendar - Calendário do imóvel
❌ /v1/property-types - Tipos de imóveis
❌ /v1/property-types/{id} - Tipo específico
❌ /v1/property-features - Características
❌ /v1/property-features/{id} - Característica específica
❌ /v1/property-adverts - Anúncios
❌ /v1/property-adverts/{id} - Anúncio específico
```

#### POST
```
❌ /v1/properties - Criar imóvel
❌ /v1/property/{id}/photo - Adicionar foto
```

#### PUT
```
❌ /v1/property/{id} - Atualizar imóvel
```

#### DELETE
```
❌ /v1/property/{id} - Remover imóvel
❌ /v1/property/{id}/photo/{photo_id} - Remover foto
```

---

### **3. DEALS (10 endpoints + relacionados 25+)**

#### GET
```
✅ /v1/deals - Listar deals (estrutura complexa)
❌ /v1/deals/search - Buscar deals
❌ /v1/deal/{id} - Deal por ID
❌ /v1/deal/{id}/properties-match - Imóveis compatíveis
❌ /v1/deal-fields - Campos customizados
❌ /v1/deal-field/{id} - Campo específico
❌ /v1/deal/filter-fields - Campos para filtro
❌ /v1/deal/filters - Filtros salvos
❌ /v1/deal/filter/{id} - Filtro específico
❌ /v1/deal/lost-reason - Motivos de perda
❌ /v1/deal/lost-reason/{id} - Motivo específico
❌ /v1/deal/range-areas - Faixas de área
❌ /v1/deal/range-values - Faixas de valor
❌ /v1/reports/deals-done - Relatório de deals fechados
```

#### POST
```
❌ /v1/deals - Criar deal
❌ /v1/deal-fields - Criar campo customizado
❌ /v1/deal/filters - Criar filtro
```

---

### **4. FINANCIAL (25+ endpoints)**

#### GET
```
✅ /v1/financial/accounts - Contas (5 registros)
✅ /v1/financial/transactions - Transações (54 registros)
❌ /v1/financial/categories - Categorias
❌ /v1/financial/categories/{id} - Categoria específica
❌ /v1/financial/landlord-accounts - Contas de proprietário
❌ /v1/financial/landlord-account/{id} - Conta específica
❌ /v1/financial/landlord-account/{id}/transactions - Transações do proprietário
❌ /v1/financial/landlord-account/{id}/onlending - Repasse
❌ /v1/financial/tags - Tags financeiras
❌ /v1/financial/tags/{id} - Tag específica
❌ /v1/financial/commissions - Comissões
❌ /v1/financial/transaction-match - Conciliação
❌ /v1/financial/transactions/attachments - Anexos
```

#### POST
```
❌ /v1/financial/accounts - Criar conta
❌ /v1/financial/transactions - Criar transação
❌ /v1/financial/categories - Criar categoria
❌ /v1/financial/tags - Criar tag
```

---

### **5. DOCUMENTS (9 endpoints)**

#### GET
```
✅ /v1/documents - Listar documentos (10 registros)
❌ /v1/document/{id} - Documento por ID
❌ /v1/documents/search - Buscar documentos
```

#### POST
```
❌ /v1/documents - Criar documento
❌ /v1/document/{id}/send - Enviar documento
```

#### PUT
```
❌ /v1/document/{id} - Atualizar documento
```

#### DELETE
```
❌ /v1/document/{id} - Remover documento
```

---

### **6. CONTRACTS (7 endpoints)**

#### GET
```
✅ /v1/contracts - Listar contratos (0 registros)
❌ /v1/contract/{id} - Contrato por ID
❌ /v1/contract/code/{code} - Contrato por código
❌ /v1/contract-fields - Campos customizados
```

#### POST
```
❌ /v1/contracts - Criar contrato
```

---

### **7. LEASES (15+ endpoints)**

#### GET
```
✅ /v1/leases - Listar locações (12 registros)
❌ /v1/lease/{id} - Locação por ID
❌ /v1/lease/code/{code} - Locação por código
❌ /v1/lease-fields - Campos customizados
❌ /v1/lease-insurance - Seguros
❌ /v1/lease/agreement - Acordos
❌ /v1/lease-item-description - Descrições de itens
❌ /v1/lease-checklist - Checklist
❌ /v1/lease/calculate - Calcular valores
```

#### POST
```
❌ /v1/leases - Criar locação
❌ /v1/lease-insurance - Criar seguro
```

---

### **8. USERS & TEAMS (14 endpoints)**

#### GET
```
✅ /v1/users - Listar usuários (17 registros) - Array direto
❌ /v1/user/{id} - Usuário por ID
❌ /v1/user/{id}/performance - Performance do usuário
❌ /v1/user/{id}/billing - Faturamento do usuário
❌ /v1/teams - Times (5 endpoints)
❌ /v1/team/{id} - Time específico
```

#### POST
```
❌ /v1/users - Criar usuário
❌ /v1/teams - Criar time
```

---

### **9. PIPELINES (10 endpoints)**

#### GET
```
✅ /v1/pipelines - Listar pipelines (7 registros) - Array direto
❌ /v1/pipeline/{id} - Pipeline por ID
❌ /v1/pipeline-groups - Grupos de pipeline
❌ /v1/pipeline-group/{id} - Grupo específico
```

#### POST
```
❌ /v1/pipelines - Criar pipeline
❌ /v1/pipeline-groups - Criar grupo
```

---

### **10. OUTROS IMPORTANTES**

#### Neighborhoods (6 endpoints)
```
❌ /v1/neighborhoods - Listar bairros
❌ /v1/neighborhoods/search - Buscar bairros
❌ /v1/neighborhood/{id} - Bairro por ID
```

#### Nota Fiscal (6 endpoints)
```
❌ /v1/notas-fiscais - Listar notas
❌ /v1/nota-fiscal/{id} - Nota por ID
❌ /v1/nota-fiscal/landlord-transactions - Notas de proprietários
```

#### Integrations & Webhooks (já implementados)
```
✅ /v1/integrations - Listar integrações (13 registros) - Array direto
✅ /v1/webhooks - Listar webhooks (4 registros) - Array direto
```

#### Outros
```
❌ /v1/invoices - Faturas (4 endpoints)
❌ /v1/proposals - Propostas (3 endpoints)
❌ /v1/banks - Bancos (3 endpoints)
❌ /v1/revisions - Revisões (3 endpoints)
❌ /v1/notifications - Notificações (3 endpoints)
❌ /v1/calendar-types - Tipos de calendário (4 endpoints)
❌ /v1/media-sources - Fontes de mídia (6 endpoints)
❌ /v1/real-estate-posts - Posts imobiliários (8 endpoints)
```

---

## 🛠️ ARQUITETURA PROPOSTA

### **Estrutura de Pastas:**

```
nodes/
├── Imobzi/                    # Node principal (básico)
├── ImobziContacts/           # Contacts & Leads (20 endpoints)
├── ImobziProperties/         # Properties completo (21 endpoints)
├── ImobziDeals/              # Deals & Pipelines (35 endpoints)
├── ImobziFinancial/          # Financial completo (25 endpoints)
├── ImobziLeases/             # Leases completo (15 endpoints)
├── ImobziDocuments/          # Documents (9 endpoints)
├── ImobziUsers/              # Users & Teams (14 endpoints)
└── ImobziWebhook/            # Webhooks (já existe)
```

### **Benefícios:**
- ✅ Cada node focado em uma área
- ✅ Mais fácil de usar (menos opções confusas)
- ✅ Melhor performance
- ✅ Facilita manutenção

---

## 📝 TEMPLATE PARA CADA ENDPOINT

Para cada endpoint, precisamos implementar:

```typescript
{
    displayName: 'Property Search',
    name: 'propertySearch',
    type: 'fixedCollection',
    default: {},
    options: [
        {
            name: 'searchParameters',
            displayName: 'Search Parameters',
            values: [
                {
                    displayName: 'Property Type',
                    name: 'property_type',
                    type: 'options',
                    typeOptions: { 
                        loadOptionsMethod: 'getPropertyTypes' 
                    },
                    default: '',
                },
                {
                    displayName: 'City',
                    name: 'city',
                    type: 'string',
                    default: '',
                },
                {
                    displayName: 'Min Price',
                    name: 'min_price',
                    type: 'number',
                    default: 0,
                },
                {
                    displayName: 'Max Price',
                    name: 'max_price',
                    type: 'number',
                    default: 0,
                },
                // ... todos os parâmetros do endpoint
            ]
        }
    ]
}
```

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### **PASSO 1: RESOLVER O PROBLEMA ATUAL**

Antes de implementar os 300 endpoints, precisamos:

1. ✅ **Resolver "Unrecognized node type"**
   - Pedir acesso SSH ao servidor
   - OU pedir para administrador reiniciar n8n
   - OU usar n8n local para testar

2. ✅ **Validar que o node básico funciona**
   - Testar GET contacts
   - Testar GET properties
   - Confirmar que retorna dados

### **PASSO 2: EXPANDIR GRADUALMENTE**

**Semana 1:**
- ✅ Properties completo (21 endpoints)
- ✅ Contacts completo (20 endpoints)

**Semana 2:**
- ✅ Deals completo (35 endpoints)
- ✅ Financial completo (25 endpoints)

**Semana 3:**
- ✅ Leases completo (15 endpoints)
- ✅ Documents completo (9 endpoints)
- ✅ Users & Teams (14 endpoints)

**Semana 4:**
- ✅ Endpoints complementares (restantes)
- ✅ Testes completos
- ✅ Documentação

---

## 🚨 DECISÃO IMPORTANTE AGORA:

**1. CORRIGIR O PROBLEMA DO NODE NÃO CARREGAR**

Você tem acesso ao servidor n8n? Se sim, preciso do acesso SSH para:
- Limpar cache do servidor
- Reiniciar o n8n corretamente
- Ver logs de erro

**2. ESCOLHER ABORDAGEM:**

**Opção A:** Nodes separados (recomendado para 300 endpoints)
**Opção B:** Node único (mais simples mas menos escalável)

**Me diga:**
1. Você tem acesso ao servidor SSH?
2. Qual abordagem prefere? (A ou B)
3. Quais recursos são mais importantes para você agora?

Assim posso criar uma solução perfeita! 🎯

