# 🔧 Solução: Persistência de Categoria no Chat

## Problema

```
Msg 1: "meu CMS filter não funciona"  → categoria: cmsfilter ✅
Msg 2: "e se isso não funcionar?"     → categoria: other ❌
```

Mensagens de follow-up não mencionam o produto, quebrando a busca no Pinecone.

---

## Solução Implementada

### 1️⃣ Criar Node: "Category Cache"

**Tipo:** Code

**Posição no Workflow:**
```
[Categorize Request Type] → [Category Cache] → [Pinecone Tool]
```

**Código:** Use o arquivo `category-cache-code.js`

---

### 2️⃣ Atualizar Pinecone Tool

No campo **namespace**, use a saída do Category Cache:

```
{{ $('Category Cache').item.json.pineconeNamespace }}
```

**Antes:**
```
{{ $('Categorize Request Type').item.json.message.content }}
```

**Depois:**
```
{{ $('Category Cache').item.json.pineconeNamespace }}
```

---

### 3️⃣ Atualizar User Message (Opcional)

Se quiser mostrar a categoria no prompt do agente:

```
Category/Product: {{ $('Category Cache').item.json.category !== 'other' ? $('Category Cache').item.json.category : '[NOT IDENTIFIED YET]' }}
```

---

## Como Funciona

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLUXO                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Msg 1: "CMS filter broken"                                     │
│    ↓                                                             │
│  Categorize → "cmsfilter"                                       │
│    ↓                                                             │
│  Category Cache → GUARDA "cmsfilter" para sessionId             │
│    ↓                                                             │
│  Pinecone → namespace: "attributes_v2"                          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Msg 2: "e se não funcionar?"                                   │
│    ↓                                                             │
│  Categorize → "other" (não menciona produto)                    │
│    ↓                                                             │
│  Category Cache → RECUPERA "cmsfilter" do cache                 │
│    ↓                                                             │
│  Pinecone → namespace: "attributes_v2" ✅                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Saída do Category Cache Node

```json
{
  "category": "cmsfilter",
  "pineconeNamespace": "attributes_v2",
  "debug": {
    "originalCategory": "other",
    "source": "cache",
    "sessionId": "abc123",
    "hadCache": true
  }
}
```

### Campos:
| Campo | Descrição |
|-------|-----------|
| `category` | Categoria final (com fallback do cache) |
| `pineconeNamespace` | Namespace normalizado para Pinecone |
| `debug.originalCategory` | O que o Categorize retornou |
| `debug.source` | "current" = nova, "cache" = recuperada |

---

## Mapeamento de Namespaces

O cache normaliza variações para o namespace correto:

| Categoria | Namespace Pinecone |
|-----------|-------------------|
| cmsfilter, cms_filter, cmsload, cmsnest | `attributes_v2` |
| attributes, attributes_v2 | `attributes_v2` |
| attributes_v1 | `attributes_v1` |
| components | `components` |
| wized | `wized` |
| client_first, clientfirst | `client_first` |
| cms_bridge, cmsbridge | `cms_bridge` |
| consent-pro, consent_pro | `consent_pro` |
| extension | `extension` |
| general | `general` |
| other (sem cache) | `general` |

---

## Arquivos Criados

1. **`category-cache-code.js`** - Código completo do Code node
2. **`categorize-with-context-config.md`** - Prompt atualizado do Categorize
3. **`CATEGORY-PERSISTENCE-SOLUTION.md`** - Este documento

---

## Implementação Passo a Passo

### Passo 1: Criar o Node
1. No n8n, adicione um **Code node** após "Categorize Request Type"
2. Nomeie como "Category Cache"
3. Cole o código de `category-cache-code.js`

### Passo 2: Conectar
1. Conecte "Categorize Request Type" → "Category Cache"
2. Conecte "Category Cache" → próximo node (Pinecone ou Merge)

### Passo 3: Atualizar Referências
1. Onde usava `$('Categorize Request Type').item.json.message.content`
2. Mude para `$('Category Cache').item.json.pineconeNamespace`

### Passo 4: Testar
1. Envie mensagem com produto: "CMS filter não funciona"
2. Envie follow-up vago: "e se não funcionar?"
3. Verifique se namespace continua correto

---

## Limpeza Automática

O cache limpa automaticamente sessões com mais de 24 horas para evitar acúmulo de dados.
