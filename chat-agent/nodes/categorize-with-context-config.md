# Node: Categorize Request Type (COM CONTEXTO)

## Problema Resolvido

Em conversas de chat, mensagens de follow-up como "e se isso não funcionar?" não mencionam o produto, causando `other` como categoria e quebrando a busca no Pinecone.

**Solução:** Incluir o histórico de conversa no prompt e instruir o modelo a manter a categoria do contexto.

---

## System Prompt (ATUALIZADO)

```
You are a helpful assistant for a support AI system.
Categorize the conversation into exactly one of these categories:
attributes_v2, cmsfilter, cmsload, cmsnest, client_first, components, cms_bridge, consent-pro, extension, wized, general, or other

Return ONLY the category name — nothing else.

═══════════════════════════════════════════════════════════════════
🔴 CRITICAL: CONTEXT PERSISTENCE RULE
═══════════════════════════════════════════════════════════════════

IMPORTANT: You will receive BOTH the current message AND the conversation history.

If the CURRENT message is vague (greeting, follow-up question, "what if", "and if", etc.)
BUT the CONVERSATION HISTORY mentions a specific product:
→ USE THE CATEGORY FROM THE CONVERSATION CONTEXT

Examples of vague follow-ups that should INHERIT category from history:
- "e se isso não funcionar?" → keep previous category
- "and what if that doesn't work?" → keep previous category
- "ok, and then?" → keep previous category
- "can you explain more?" → keep previous category
- "show me an example" → keep previous category
- "thanks, but I have another question about this" → keep previous category

ONLY return "other" if:
1. Current message is vague AND
2. Conversation history has NO product mentions

═══════════════════════════════════════════════════════════════════
TECHNICAL INDICATORS
═══════════════════════════════════════════════════════════════════

CMSFILTER / ATTRIBUTES_V2:
✓ fs-cmsfilter-*, fs-cmssort-*, fs-cmsload-*, fs-cmsnest-*, fs-list-*
✓ "CMS Filter", "List Filter", "CMS Load", "CMS Nest", "inject elements"
✓ "filtering", "sorting", "pagination", "load more" + CMS context
✓ Collection list manipulation, dynamic filtering

COMPONENTS:
✓ fs-slider-*, fs-marquee-*, fs-favorite-*, fs-cc-*
✓ "Slider", "Marquee", "Auto Tabs", "Favorite", "Cookie Consent"
✓ "Components App", pre-built UI components

WIZED:
✓ "Wized", "wized.io", "data requests", "API integration"
✓ "authentication", "user login", "Supabase", "Xano" (app context)
✓ Web app development, data binding

CMS BRIDGE:
✓ "Airtable sync", "Google Sheets sync", "external database"
✓ fs-cmsbridge-*, data synchronization

CONSENT PRO:
✓ "Consent Pro", "GDPR compliance", "consent analytics"
✓ Advanced cookie consent management

CLIENT FIRST:
✓ "Client-First", "naming convention", "methodology"
✓ "spacing system", "rem", "class naming"

EXTENSION:
✓ "Finsweet Extension", "Chrome extension"
✓ "rem converter", "px to rem", "Webflow Designer tools"

GENERAL:
✓ "pricing", "membership", "subscription", "billing"
✓ General questions about Finsweet without technical specifics

OTHER:
✓ Greetings only WITH NO history context
✓ Vague messages WITH NO history context
✓ Doesn't fit above categories AND no context available

═══════════════════════════════════════════════════════════════════
EXAMPLES WITH CONTEXT
═══════════════════════════════════════════════════════════════════

Example 1:
History: "User: my CMS filter isn't working. AI: Let me help..."
Current: "e se isso não funcionar?"
→ cmsfilter (INHERITED from history)

Example 2:
History: "User: Wized login error. AI: Try checking..."
Current: "ok, and then what?"
→ wized (INHERITED from history)

Example 3:
History: (empty)
Current: "hi, need help"
→ other (no context to inherit)

Example 4:
History: "User: hi. AI: Hello! How can I help?"
Current: "my slider component is broken"
→ components (NEW category identified)

═══════════════════════════════════════════════════════════════════
DISAMBIGUATION RULES
═══════════════════════════════════════════════════════════════════

1. EXPLICIT product mentions win over inherited category
2. "slider" is AMBIGUOUS:
   - "slider" + "CMS" or "collection" or "fs-list" → cmsfilter
   - "slider" + "Components" or "fs-slider" → components
   - Just "slider" alone → components (default)
3. Version detection for Attributes:
   - Default to attributes_v2 (current version)
   - Only use attributes_v1 if explicitly mentioned "v1" or "legacy"
```

---

## User Message (ATUALIZADO COM HISTÓRICO)

No n8n, você precisa passar o histórico. Use esta estrutura:

```
=== CONVERSATION HISTORY ===
{{ $('Window Buffer Memory').item.json.chatHistory || 'No previous messages' }}

=== CURRENT MESSAGE ===
{{ $('Receive New Discourse Message').item.json.chatInput }}

Based on both the history AND current message, determine the category.
If current message is vague but history mentions a product, use that category.
```

### Alternativa se Window Buffer Memory não estiver disponível:

Se o Memory node não exporta `chatHistory` diretamente, você pode usar um Code node antes do Categorize para extrair o histórico:

```javascript
// Code Node: Prepare Category Context
const chatInput = $('Receive New Discourse Message').item.json.chatInput;

// Tenta pegar histórico de diferentes fontes possíveis
let history = '';

try {
  // Opção 1: Window Buffer Memory
  const memoryData = $('Window Buffer Memory').first();
  if (memoryData?.json?.chatHistory) {
    history = memoryData.json.chatHistory;
  }
} catch (e) {}

try {
  // Opção 2: Chat Memory Manager
  const chatMemory = $('Chat Memory Manager').first();
  if (chatMemory?.json?.messages) {
    history = chatMemory.json.messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
  }
} catch (e) {}

return [{
  json: {
    currentMessage: chatInput,
    conversationHistory: history || 'No previous messages',
    fullContext: history
      ? `=== CONVERSATION HISTORY ===\n${history}\n\n=== CURRENT MESSAGE ===\n${chatInput}`
      : `=== CURRENT MESSAGE ===\n${chatInput}`
  }
}];
```

---

## Estrutura do Workflow Atualizada

```
[Chat Input]
    ↓
[Window Buffer Memory] ← guarda histórico
    ↓
[Code: Prepare Context] ← extrai histórico
    ↓
[Categorize Request Type] ← recebe histórico + mensagem atual
    ↓
[Pinecone Search] ← usa categoria correta
```

---

## Comparação: Antes vs Depois

| Cenário | Antes | Depois |
|---------|-------|--------|
| Msg 1: "CMS filter broken" | `cmsfilter` ✅ | `cmsfilter` ✅ |
| Msg 2: "e se não funcionar?" | `other` ❌ | `cmsfilter` ✅ |
| Msg 3: "show me example" | `other` ❌ | `cmsfilter` ✅ |
| Msg 4: "now I have Wized question" | `other` ❌ | `wized` ✅ |

---

## Fallback: Se Histórico Não Disponível

Se por algum motivo o histórico não estiver acessível, crie um **Category Cache** usando n8n variables ou um Set node que guarda a última categoria válida da sessão:

```javascript
// No início do workflow, após Categorize
const currentCategory = $('Categorize Request Type').item.json.message.content;
const sessionId = $('Receive New Discourse Message').item.json.sessionId;

// Se categoria válida (não é 'other'), guarda no cache
if (currentCategory !== 'other') {
  // Usa Static Data do workflow para persistir
  $workflow.staticData.categoryCache = $workflow.staticData.categoryCache || {};
  $workflow.staticData.categoryCache[sessionId] = currentCategory;
}

// Se categoria é 'other', tenta recuperar do cache
let finalCategory = currentCategory;
if (currentCategory === 'other') {
  const cached = $workflow.staticData.categoryCache?.[sessionId];
  if (cached) {
    finalCategory = cached;
  }
}

return [{ json: { category: finalCategory } }];
```

---

## Notas Importantes

1. **O histórico de conversa é essencial** para manter contexto em chats
2. **Greetings iniciais** ainda retornam `other` (correto - AI vai perguntar qual produto)
3. **Mudança de assunto** é detectada se usuário menciona novo produto explicitamente
4. **Session ID** garante que cache é por usuário/conversa
