// Script completo de teste de TODOS os endpoints da API Imobzi
const https = require('https');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkX2F0IjoiMjAyNS0xMi0xMFQxMzowNzo1MC43MDM3MzVaIiwiaXNfdGhpcmRfcGFydHlfYWNjZXNzIjp0cnVlLCJ0aGlyZF9wYXJ0eV9hcHBfaWQiOiJoNTZDNGpqNXc3RjgifQ.mNrABlX_L88mBKG4isoKm5pnycR43J3b-3Wku8pBIFk';

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.imobzi.app',
            path: path,
            method: 'GET',
            headers: {
                'X-Imobzi-Secret': apiKey,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`\n${'='.repeat(80)}`);
                console.log(`ENDPOINT: ${path}`);
                console.log(`Status: ${res.statusCode}`);
                console.log('='.repeat(80));
                
                try {
                    const json = JSON.parse(data);
                    
                    // Mostrar estrutura
                    console.log('Tipo:', typeof json);
                    console.log('É Array?:', Array.isArray(json));
                    
                    if (typeof json === 'object' && !Array.isArray(json)) {
                        console.log('Chaves principais:', Object.keys(json).join(', '));
                        
                        // Verificar onde estão os dados
                        const possibleDataKeys = ['properties', 'contacts', 'contracts', 'leases', 
                            'documents', 'users', 'deals', 'pipelines', 'invoices', 'data', 'results', 
                            'timeline', 'calendar', 'tasks', 'accounts', 'transactions'];
                        
                        possibleDataKeys.forEach(key => {
                            if (json[key] !== undefined) {
                                if (Array.isArray(json[key])) {
                                    console.log(`✓ DADOS EM "${key}": ${json[key].length} itens`);
                                    if (json[key].length > 0) {
                                        console.log(`  Primeiro item (chaves):`, Object.keys(json[key][0]).slice(0, 10).join(', '));
                                    }
                                } else {
                                    console.log(`✓ "${key}" existe mas não é array:`, typeof json[key]);
                                }
                            }
                        });
                        
                        // Verificar paginação
                        if (json.cursor) console.log('✓ Cursor:', json.cursor.substring(0, 50) + '...');
                        if (json.count !== undefined) console.log('✓ Count:', json.count);
                        if (json.total !== undefined) console.log('✓ Total:', json.total);
                    }
                    
                    // Mostrar primeiros 500 caracteres da resposta
                    console.log('\nResposta (preview):');
                    console.log(JSON.stringify(json, null, 2).substring(0, 500) + '...');
                    
                    resolve({ path, status: res.statusCode, data: json });
                } catch (e) {
                    console.log('Erro ao parsear JSON:', e.message);
                    console.log('Resposta raw:', data.substring(0, 500));
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`\nERRO em ${path}:`, e.message);
            reject(e);
        });

        req.setTimeout(10000, () => {
            console.error(`\nTIMEOUT em ${path}`);
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

async function testAllEndpoints() {
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(20) + 'TESTE COMPLETO DA API IMOBZI' + ' '.repeat(30) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');
    
    const endpoints = [
        '/v1/properties',
        '/v1/contacts',
        '/v1/contracts',
        '/v1/leases',
        '/v1/documents',
        '/v1/users',
        '/v1/deals',
        '/v1/pipelines',
        '/v1/timeline',
        '/v1/calendar',
        '/v1/financial/accounts',
        '/v1/financial/transactions',
        '/v1/integrations',
        '/v1/webhooks',
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const result = await testEndpoint(endpoint);
            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre requests
        } catch (error) {
            results.push({ path: endpoint, error: error.message });
        }
    }
    
    // Resumo final
    console.log('\n\n' + '='.repeat(80));
    console.log('RESUMO DOS TESTES');
    console.log('='.repeat(80));
    
    results.forEach(r => {
        if (r.status) {
            const dataKeys = Object.keys(r.data || {}).filter(k => 
                Array.isArray(r.data[k]) || typeof r.data[k] === 'object'
            );
            console.log(`✓ ${r.path}: ${r.status} - Chaves: ${dataKeys.join(', ')}`);
        } else {
            console.log(`✗ ${r.path}: ${r.error}`);
        }
    });
}

testAllEndpoints().catch(console.error);

