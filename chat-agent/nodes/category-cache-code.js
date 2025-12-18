/**
 * Category Cache - SEM PERSISTÊNCIA (até ter Supabase)
 *
 * NOTA: Sem banco de dados, não é possível manter cache entre execuções.
 * Por enquanto, apenas valida e mapeia categorias.
 * Quando implementar Supabase, adicionar lógica de cache.
 */

// Pega a categoria do Categorize
const rawCategory = $input.first().json.message?.content || 'other';
const currentCategory = rawCategory.toLowerCase().trim();

// Categorias válidas
const VALID = ['attributes_v1', 'attributes_v2', 'client_first', 'components', 'cms_bridge', 'consent-pro', 'extension', 'wized', 'general'];

// Se válida usa ela, senão usa general
const finalCategory = VALID.includes(currentCategory) ? currentCategory : 'general';

return [{
  json: {
    category: finalCategory,
    pineconeNamespace: finalCategory,
    original: currentCategory,
    note: currentCategory === 'other' ? 'Cache requires Supabase - using general fallback' : null
  }
}];
