/**
 * Category Cache - COM PERSISTÊNCIA
 */

// Pega a categoria do Categorize
const rawCategory = $input.first().json.message?.content || 'other';
const currentCategory = rawCategory.toLowerCase().trim();

// Pega o sessionId para identificar a conversa
const sessionId = $('Receive New Discourse Message').item.json.sessionId;

// Categorias válidas
const VALID = ['attributes_v1', 'attributes_v2', 'client_first', 'components', 'cms_bridge', 'consent-pro', 'extension', 'wized', 'general'];

// Inicializa cache
if (!$workflow.staticData.cache) {
  $workflow.staticData.cache = {};
}

let finalCategory;
let source;

if (VALID.includes(currentCategory)) {
  // Categoria válida - guarda no cache
  finalCategory = currentCategory;
  source = 'current';
  $workflow.staticData.cache[sessionId] = currentCategory;

} else if (currentCategory === 'other' && $workflow.staticData.cache[sessionId]) {
  // "other" mas tem cache - recupera
  finalCategory = $workflow.staticData.cache[sessionId];
  source = 'cache';

} else {
  // Sem cache - usa general
  finalCategory = 'general';
  source = 'fallback';
}

return [{
  json: {
    category: finalCategory,
    pineconeNamespace: finalCategory,
    original: currentCategory,
    source: source,
    sessionId: sessionId
  }
}];
