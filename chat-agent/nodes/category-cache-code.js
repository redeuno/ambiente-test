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

// Lista de categorias válidas (que têm namespace no Pinecone)
const VALID_CATEGORIES = [
  'attributes',
  'attributes_v1',
  'attributes_v2',
  'cmsfilter',
  'cms_filter',
  'cmsload',
  'cms_load',
  'cmsnest',
  'cms_nest',
  'cmssort',
  'cms_sort',
  'client_first',
  'clientfirst',
  'components',
  'cms_bridge',
  'cmsbridge',
  'consent-pro',
  'consent_pro',
  'consentpro',
  'extension',
  'wized',
  'general'
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

// Mapeamento para namespace do Pinecone (normaliza variações)
const NAMESPACE_MAP = {
  'attributes': 'attributes_v2',
  'attributes_v1': 'attributes_v1',
  'attributes_v2': 'attributes_v2',
  'cmsfilter': 'attributes_v2',
  'cms_filter': 'attributes_v2',
  'cmsload': 'attributes_v2',
  'cms_load': 'attributes_v2',
  'cmsnest': 'attributes_v2',
  'cms_nest': 'attributes_v2',
  'cmssort': 'attributes_v2',
  'cms_sort': 'attributes_v2',
  'client_first': 'client_first',
  'clientfirst': 'client_first',
  'components': 'components',
  'cms_bridge': 'cms_bridge',
  'cmsbridge': 'cms_bridge',
  'consent-pro': 'consent_pro',
  'consent_pro': 'consent_pro',
  'consentpro': 'consent_pro',
  'extension': 'extension',
  'wized': 'wized',
  'general': 'general'
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
