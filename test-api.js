// Script de teste para verificar formato de resposta da API Imobzi
// Execute: node test-api.js
// Você precisará substituir SEU_TOKEN_AQUI pela sua chave de API

const https = require('https');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkX2F0IjoiMjAyNS0xMi0xMFQxMzowNzo1MC43MDM3MzVaIiwiaXNfdGhpcmRfcGFydHlfYWNjZXNzIjp0cnVlLCJ0aGlyZF9wYXJ0eV9hcHBfaWQiOiJoNTZDNGpqNXc3RjgifQ.mNrABlX_L88mBKG4isoKm5pnycR43J3b-3Wku8pBIFk';

function testAPI(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.imobzi.app',
            path: `/v1${endpoint}`,
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
                console.log(`\n========== TESTE: ${endpoint} ==========`);
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
                
                try {
                    const json = JSON.parse(data);
                    console.log(`\nResposta (primeiras linhas):`);
                    console.log(JSON.stringify(json, null, 2).substring(0, 1000));
                    
                    // Verificar estrutura
                    console.log(`\n--- Estrutura da Resposta ---`);
                    console.log(`Tipo da resposta:`, typeof json);
                    console.log(`É array?:`, Array.isArray(json));
                    if (typeof json === 'object' && !Array.isArray(json)) {
                        console.log(`Chaves do objeto:`, Object.keys(json));
                    }
                    
                    resolve(json);
                } catch (e) {
                    console.log(`Resposta (texto):`, data.substring(0, 500));
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Erro ao fazer requisição: ${e.message}`);
            reject(e);
        });

        req.end();
    });
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('TESTANDO API IMOBZI');
    console.log('='.repeat(60));
    
    try {
        // Testar endpoints principais
        await testAPI('/properties');
        await testAPI('/contacts');
        
    } catch (error) {
        console.error('Erro geral:', error);
    }
}

runTests();

