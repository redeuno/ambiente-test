/**
 * Category Cache - Mantém categoria da sessão
 *
 * PROBLEMA: Mensagens de follow-up como "e se não funcionar?" retornam "other"
 * SOLUÇÃO: Guardar a última categoria válida e reutilizar quando necessário
 *
 * ONDE COLOCAR: Criar um Code node APÓS o "Categorize Request Type"
 *
 * CONEXÕES:
 * [Categorize Request Type] → [Category Cache] → [Pinecone/Next nodes]
 */

// Pega dados necessários
const sessionId = $('Receive New Discourse Message').item.json.sessionId;
const rawCategory = $('Categorize Request Type').item.json.message.content;

// Normaliza a categoria (lowercase, trim)
const currentCategory = rawCategory.toLowerCase().trim();

// Inicializa o cache se não existir
$workflow.staticData.categoryCache = $workflow.staticData.categoryCache || {};

// ═══════════════════════════════════════════════════════════════════
// CATEGORIAS VÁLIDAS - Exatamente como retornadas pelo Categorize
// ═══════════════════════════════════════════════════════════════════
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
  // 'other' NÃO é válida - é o fallback quando não identifica
];

// Verifica se a categoria atual é válida
const isValidCategory = VALID_CATEGORIES.includes(currentCategory);

let finalCategory;
let categorySource;

if (isValidCategory) {
  // Categoria válida - usa e guarda no cache
  finalCategory = currentCategory;
  categorySource = 'current';

  // Atualiza o cache para esta sessão
  $workflow.staticData.categoryCache[sessionId] = {
    category: currentCategory,
    timestamp: Date.now()
  };

} else if (currentCategory === 'other') {
  // Categoria é "other" - tenta recuperar do cache
  const cached = $workflow.staticData.categoryCache[sessionId];

  if (cached && cached.category) {
    // Tem cache válido - usa a categoria anterior
    finalCategory = cached.category;
    categorySource = 'cache';
  } else {
    // Não tem cache - mantém "other" (AI vai perguntar qual produto)
    finalCategory = 'other';
    categorySource = 'none';
  }

} else {
  // Categoria desconhecida - trata como "other"
  finalCategory = 'other';
  categorySource = 'unknown';
}

// ═══════════════════════════════════════════════════════════════════
// MAPEAMENTO PARA NAMESPACE DO PINECONE
// ═══════════════════════════════════════════════════════════════════
// As categorias mapeiam 1:1 para namespaces, exceto consent-pro
const NAMESPACE_MAP = {
  'attributes_v1': 'attributes_v1',
  'attributes_v2': 'attributes_v2',
  'client_first': 'client_first',
  'components': 'components',
  'cms_bridge': 'cms_bridge',
  'consent-pro': 'consent-pro',   // Mantém com hífen se Pinecone usa assim
  'extension': 'extension',
  'wized': 'wized',
  'general': 'general',
  'other': 'general'              // Fallback para general se não identificou
};

// Determina o namespace do Pinecone
const pineconeNamespace = NAMESPACE_MAP[finalCategory] || 'general';

// Limpa cache antigo (mais de 24 horas)
const ONE_DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
for (const [key, value] of Object.entries($workflow.staticData.categoryCache)) {
  if (now - value.timestamp > ONE_DAY) {
    delete $workflow.staticData.categoryCache[key];
  }
}

return [{
  json: {
    // Categoria final (com fallback do cache se necessário)
    category: finalCategory,

    // Namespace para usar no Pinecone
    pineconeNamespace: pineconeNamespace,

    // Metadados para debug
    debug: {
      originalCategory: currentCategory,
      source: categorySource,
      sessionId: sessionId,
      hadCache: !!$workflow.staticData.categoryCache[sessionId]
    }
  }
}];
