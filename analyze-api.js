// Análise completa da API Imobzi
const fs = require('fs');

const apiData = JSON.parse(fs.readFileSync('imobzi-api-completa.json', 'utf8'));

console.log('╔' + '═'.repeat(78) + '╗');
console.log('║' + ' '.repeat(25) + 'ANÁLISE COMPLETA DA API' + ' '.repeat(30) + '║');
console.log('╚' + '═'.repeat(78) + '╝\n');

console.log(`Total de endpoints: ${apiData.info.total_endpoints}`);
console.log(`Base URL: ${apiData.info.base_url}`);
console.log(`Data de extração: ${apiData.info.data_extracao}\n`);

// Agrupar por categoria
const categorias = {};
const metodos = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 };
const endpoints = new Set();

Object.keys(apiData.categorias).forEach(cat => {
    categorias[cat] = apiData.categorias[cat].length;
    
    apiData.categorias[cat].forEach(endpoint => {
        metodos[endpoint.method] = (metodos[endpoint.method] || 0) + 1;
        endpoints.add(endpoint.path);
    });
});

console.log('═'.repeat(80));
console.log('CATEGORIAS E QUANTIDADE DE ENDPOINTS:');
console.log('═'.repeat(80));
Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} endpoints`);
});

console.log('\n' + '═'.repeat(80));
console.log('MÉTODOS HTTP:');
console.log('═'.repeat(80));
Object.entries(metodos).forEach(([method, count]) => {
    if (count > 0) console.log(`  ${method}: ${count}`);
});

console.log('\n' + '═'.repeat(80));
console.log('ENDPOINTS ÚNICOS (primeiros 30):');
console.log('═'.repeat(80));
Array.from(endpoints).slice(0, 30).forEach(path => {
    console.log(`  ${path}`);
});

// Analisar parâmetros mais comuns
const parametros = {};
Object.values(apiData.categorias).flat().forEach(endpoint => {
    endpoint.parametros?.forEach(param => {
        parametros[param.name] = (parametros[param.name] || 0) + 1;
    });
});

console.log('\n' + '═'.repeat(80));
console.log('PARÂMETROS MAIS COMUNS (top 20):');
console.log('═'.repeat(80));
Object.entries(parametros)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([param, count]) => {
        console.log(`  ${param}: ${count} endpoints`);
    });

// Verificar endpoints GET principais
console.log('\n' + '═'.repeat(80));
console.log('ENDPOINTS GET PRINCIPAIS (para implementar):');
console.log('═'.repeat(80));
const getEndpoints = {};
Object.values(apiData.categorias).flat()
    .filter(e => e.method === 'GET')
    .forEach(e => {
        const base = e.path.split('/').slice(0, 3).join('/');
        getEndpoints[base] = (getEndpoints[base] || 0) + 1;
    });

Object.entries(getEndpoints)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .forEach(([path, count]) => {
        console.log(`  ${path}: ${count} variações`);
    });

console.log('\n' + '═'.repeat(80));
console.log('ANÁLISE COMPLETA CONCLUÍDA!');
console.log('═'.repeat(80));

