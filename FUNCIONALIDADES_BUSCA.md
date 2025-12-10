# 🔍 Funcionalidades de Busca - Versão 1.0.0

## 📋 Visão Geral

A partir da versão 1.0.0, o node Imobzi suporta buscas avançadas por múltiplos critérios, não apenas por ID.

## ✅ Recursos com Busca Avançada

### 1. **Contacts (Contatos)**
- ✅ Busca por ID
- ✅ Busca por Código
- ✅ Busca por Email
- ✅ Busca por Telefone
- ✅ Busca por CPF
- ✅ Busca por Nome

### 2. **Leads**
- ✅ Busca por ID
- ✅ Busca por Código
- ✅ Busca por Email
- ✅ Busca por Telefone
- ✅ Busca por CPF
- ✅ Busca por Nome

### 3. **Properties (Imóveis)**
- ✅ Busca por ID
- ✅ Busca por Código
- ✅ Busca por Nome/Título

### 4. **Contracts (Contratos)**
- ✅ Busca por ID
- ✅ Busca por Código

### 5. **Leases (Locações)**
- ✅ Busca por ID
- ✅ Busca por Código

## 🎯 Como Usar

### Operação **Get** (Buscar um item específico)

1. Selecione o recurso (ex: Contact, Lead, Property)
2. Selecione a operação **Get**
3. Escolha **"Buscar por"**:
   - **ID**: Busca pelo ID numérico
   - **Código**: Busca pelo código do item
   - **Email**: Busca por email (Contacts/Leads)
   - **Telefone**: Busca por telefone (Contacts/Leads)
   - **CPF**: Busca por CPF (Contacts/Leads)
   - **Nome**: Busca por nome (retorna primeiro resultado)
4. Digite o **Valor** correspondente

**Exemplo - Buscar Contato por Email:**
```
Recurso: Contact
Operação: Get
Buscar por: Email
Valor: joao@exemplo.com
```

**Exemplo - Buscar Lead por CPF:**
```
Recurso: Lead
Operação: Get
Buscar por: CPF
Valor: 123.456.789-00
```

**Exemplo - Buscar Imóvel por Código:**
```
Recurso: Property
Operação: Get
Buscar por: Código
Valor: PROP-12345
```

### Operação **Get All** (Listar com filtros)

1. Selecione o recurso
2. Selecione a operação **Get All**
3. Use a seção **"Busca Rápida"** para campos comuns:
   - **Email**: Filtrar por email
   - **Telefone**: Filtrar por telefone
   - **CPF**: Filtrar por CPF
   - **Nome**: Filtrar por nome
4. Use **"Filtros Avançados"** para outros campos

**Exemplo - Listar Contatos por Email:**
```
Recurso: Contact
Operação: Get All
Busca Rápida:
  Email: joao@exemplo.com
```

**Exemplo - Listar Leads por Telefone:**
```
Recurso: Lead
Operação: Get All
Busca Rápida:
  Telefone: (11) 99999-9999
```

## 🔧 Detalhes Técnicos

### Endpoints Utilizados

#### Contacts/Leads
- **Por ID**: `/v1/person/{person_id}` ou `/v1/lead/{lead_id}`
- **Por Código**: `/v1/person/code/{person_code}` ou `/v1/lead/code/{lead_code}`
- **Por Email/Telefone/CPF**: `/v1/contact/exists?email=...&phone_number=...&cpf=...`
- **Por Nome**: `/v1/contacts/search?search_text=...`

#### Properties
- **Por ID**: `/v1/property/{property_id}`
- **Por Código**: `/v1/property/code/{property_code}`
- **Por Nome**: `/v1/properties?search_text=...`

#### Contracts
- **Por ID**: `/v1/contract/{contract_id}`
- **Por Código**: `/v1/contract/code/{contract_code}`

#### Leases
- **Por ID**: `/v1/lease/{lease_id}`
- **Por Código**: `/v1/lease/code/{lease_code}` (se disponível)

## 📝 Notas Importantes

1. **Busca por Nome**: Retorna o primeiro resultado encontrado. Para múltiplos resultados, use **Get All** com filtro.

2. **Busca por Email/Telefone/CPF**: Usa o endpoint `/v1/contact/exists` que retorna o contato se existir.

3. **Get All com Busca Rápida**: Para Contacts/Leads, se você usar busca rápida, o sistema automaticamente usa o endpoint `/v1/contacts/search` que é otimizado para buscas.

4. **Compatibilidade**: A busca por ID continua funcionando como antes, mantendo compatibilidade com workflows existentes.

## 🎓 Exemplos Práticos

### Exemplo 1: Encontrar um contato pelo email
```
1. Adicione o node "Imobzi"
2. Configure:
   - Resource: Contact
   - Operation: Get
   - Buscar por: Email
   - Valor: cliente@empresa.com
3. Execute o workflow
```

### Exemplo 2: Listar todos os leads de um telefone específico
```
1. Adicione o node "Imobzi"
2. Configure:
   - Resource: Lead
   - Operation: Get All
   - Busca Rápida:
     - Telefone: (11) 98765-4321
3. Execute o workflow
```

### Exemplo 3: Buscar imóvel pelo código
```
1. Adicione o node "Imobzi"
2. Configure:
   - Resource: Property
   - Operation: Get
   - Buscar por: Código
   - Valor: APT-2024-001
3. Execute o workflow
```

## 🚀 Benefícios

✅ **Mais Flexibilidade**: Não precisa saber o ID para buscar um item  
✅ **Busca Natural**: Use email, telefone, CPF que são mais fáceis de lembrar  
✅ **Mais Rápido**: Endpoints otimizados para busca  
✅ **Compatível**: Funciona junto com buscas por ID existentes  

---

**Versão**: 1.0.0  
**Data**: Dezembro 2024  
**Autor**: Bruno Mantovani  
**Repositório**: https://github.com/redeuno/imobzi-new


