/**
 * Category Cache - Mantém categoria da sessão
 * VERSÃO SIMPLIFICADA
 */

// Pega dados necessários
const sessionId = $('Receive New Discourse Message').item.json.sessionId;
const rawCategory = $('Categorize Request Type').item.json.message.content;

// Normaliza a categoria
const currentCategory = rawCategory ? rawCategory.toLowerCase().trim() : 'other';

// Categorias válidas (que têm namespace no Pinecone)
const VALID_CATEGORIES = [
  'attributes_v1',
  'attributes_v2',
  'client_first',
  'components',
  'cms_bridge',
  'consent-pro',
  'extension',
  'wized',
  'general'
];

// Inicializa cache se não existir
if (!$workflow.staticData.categoryCache) {
  $workflow.staticData.categoryCache = {};
}

let finalCategory;
let categorySource;

// Verifica se categoria é válida
if (VALID_CATEGORIES.includes(currentCategory)) {
  // Categoria válida - usa e guarda
  finalCategory = currentCategory;
  categorySource = 'current';
  $workflow.staticData.categoryCache[sessionId] = currentCategory;

} else if (currentCategory === 'other') {
  // Tenta recuperar do cache
  const cached = $workflow.staticData.categoryCache[sessionId];
  if (cached) {
    finalCategory = cached;
    categorySource = 'cache';
  } else {
    finalCategory = 'other';
    categorySource = 'none';
  }
} else {
  finalCategory = 'other';
  categorySource = 'unknown';
}

// Namespace = categoria (mapeamento 1:1)
// Se "other" sem cache, usa "general" como fallback
const pineconeNamespace = finalCategory === 'other' ? 'general' : finalCategory;

return [{
  json: {
    category: finalCategory,
    pineconeNamespace: pineconeNamespace,
    debug: {
      originalCategory: currentCategory,
      source: categorySource,
      sessionId: sessionId
    }
  }
}];
