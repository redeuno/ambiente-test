# Node: Clean HTML

## Status: Precisa Ajuste ⚠️

O código atual tem referência ao Discourse para pegar categoria:

```javascript
// STEP 0: GET CATEGORY_ID FROM WEBHOOK
const webhookNode = $('Receive New Discourse Message').first();
if (webhookNode?.json?.body?.post?.category_id) {
    categoryId = webhookNode.json.body.post.category_id;
}
```

No **Chat** não temos categoria do fórum - será detectada pela IA depois.

---

## Ajustes Necessários

### 1. Trocar referência do Discourse para Chat

**Linha ~95 - Trocar:**
```javascript
const webhookNode = $('Receive New Discourse Message').first();
```

**Por:**
```javascript
// Try to get category from Categorize node (if already processed)
// In chat mode, category may not be available yet - that's OK
let webhookNode = null;
let categoryFromChat = null;

try {
    // Chat mode: category comes from Categorize Request Type node
    const categorizeNode = $('Categorize Request Type').first();
    if (categorizeNode?.json?.message?.content) {
        categoryFromChat = categorizeNode.json.message.content;
    }
} catch (e) {
    // Category not available yet - normal in chat flow
}

try {
    // Legacy: Discourse mode
    webhookNode = $('Receive New Discourse Message').first();
} catch (e) {
    // Not Discourse mode
}
```

### 2. Adaptar detecção de categoria

**Adicionar após as tentativas de obter categoria:**
```javascript
// Map category string to categoryId (for chat mode)
const CATEGORY_STRING_MAP = {
    'attributes': 5,
    'attributes_v2': 5,
    'finsweet_attributes_v2': 5,
    'cmsfilter': 6,
    'cms_filter': 6,
    'cmsload': 7,
    'cms_load': 7,
    'cmsnest': 8,
    'cms_nest': 8,
    'components': 16,
    'slider': 17,
    'cookie_consent': 18,
    'marquee': 19,
    'wized': 23,
    'client_first': 24,
    'client-first': 24,
    'cms_bridge': 25,
    'cms-bridge': 25,
    'extension': 26,
    'consent_pro': 27,
    'consent-pro': 27,
    'other': null,
    'unknown': null
};

// Determine categoryId
if (webhookNode?.json?.body?.post?.category_id) {
    // Discourse mode
    categoryId = webhookNode.json.body.post.category_id;
    webhookCategorySlug = webhookNode.json.body.post.category_slug || '';
} else if (categoryFromChat) {
    // Chat mode: convert string to ID
    const normalizedCat = categoryFromChat.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    categoryId = CATEGORY_STRING_MAP[normalizedCat] || null;
    webhookCategorySlug = categoryFromChat;
}
```

### 3. Tratar caso sem categoria (chat inicial)

O código já lida bem com `categoryId = null`, então não precisa de mudanças significativas. A detecção baseada em HTML (`htmlContainsAttributes`) continua funcionando.

---

## Código Completo Adaptado (Seção STEP 0)

```javascript
// ========================================
// STEP 0: GET CATEGORY (CHAT OR DISCOURSE)
// ========================================

let categoryId = null;
let webhookCategorySlug = '';
let categorySource = 'none';

// Map category strings to IDs (for chat mode)
const CATEGORY_STRING_MAP = {
    'attributes': 5,
    'attributes_v2': 5,
    'finsweet_attributes_v2': 5,
    'cmsfilter': 6,
    'cms_filter': 6,
    'cmsload': 7,
    'cms_load': 7,
    'cmsnest': 8,
    'cms_nest': 8,
    'cmscombine': 9,
    'cmssort': 10,
    'components': 16,
    'slider': 17,
    'cookie_consent': 18,
    'marquee': 19,
    'favorite': 21,
    'wized': 23,
    'client_first': 24,
    'client-first': 24,
    'cms_bridge': 25,
    'cms-bridge': 25,
    'extension': 26,
    'consent_pro': 27,
    'consent-pro': 27,
    'other': null,
    'unknown': null
};

// Try Chat mode first (Categorize node)
try {
    const categorizeNode = $('Categorize Request Type').first();
    if (categorizeNode?.json?.message?.content) {
        const categoryFromChat = categorizeNode.json.message.content;
        const normalizedCat = categoryFromChat.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        categoryId = CATEGORY_STRING_MAP[normalizedCat] || null;
        webhookCategorySlug = categoryFromChat;
        categorySource = 'chat';
    }
} catch (e) {
    // Categorize node not available
}

// Fallback to Discourse mode
if (!categoryId) {
    try {
        const webhookNode = $('Receive New Discourse Message').first();
        if (webhookNode?.json?.body?.post?.category_id) {
            categoryId = webhookNode.json.body.post.category_id;
            webhookCategorySlug = webhookNode.json.body.post.category_slug || '';
            categorySource = 'discourse';
        }
    } catch (e) {
        // Discourse node not available
    }
}

// If still no category, detection will be purely HTML-based (that's OK)
if (!categoryId) {
    categorySource = 'html-detection';
}
```

---

## Output Adicional

Adicionar `categorySource` no technicalDetails:

```javascript
technicalDetails: {
    // ... existing fields ...
    categorySource: categorySource,  // 'chat' | 'discourse' | 'html-detection'
}
```

---

## Resumo

| Modo | Como pega categoria | Fallback |
|------|---------------------|----------|
| **Discourse** | `body.post.category_id` | HTML detection |
| **Chat** | `Categorize Request Type` node | HTML detection |
| **Sem categoria** | N/A | HTML detection |

O código de detecção baseado em HTML (`fs-cmsfilter-element`, etc.) funciona independente da categoria, então mesmo sem categoria o Clean HTML consegue identificar os produtos Finsweet.
