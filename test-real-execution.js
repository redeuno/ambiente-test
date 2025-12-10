#!/usr/bin/env node

/**
 * TESTE REAL - Simula execução do n8n
 */

console.log('=== TESTE REAL DE EXECUÇÃO ===\n');

// Simular contexto do n8n
const mockExecutionContext = {
	getInputData: () => [{ json: { test: true } }],
	getNodeParameter: (param, index) => {
		if (param === 'resource') return 'lead';
		if (param === 'operation') return 'getAll';
		return undefined;
	},
	getNode: () => ({ name: 'Imobzi Test', type: 'imobzi' }),
	continueOnFail: () => false,
	helpers: {
		requestWithAuthentication: async (context, credType, options) => {
			console.log('✓ requestWithAuthentication chamado');
			console.log('  credType:', credType);
			console.log('  url:', options.url || options.baseURL + options.uri);
			console.log('  method:', options.method);
			
			// Simular resposta
			return {
				data: [
					{ id: 1, name: 'Lead Teste 1' },
					{ id: 2, name: 'Lead Teste 2' }
				]
			};
		}
	}
};

async function testNode(nodeName, NodeClass) {
	console.log(`\n${'='.repeat(60)}`);
	console.log(`TESTANDO: ${nodeName}`);
	console.log('='.repeat(60));
	
	try {
		// Instanciar
		const instance = new NodeClass();
		console.log('✓ Instância criada');
		
		// Verificar description
		if (!instance.description) {
			throw new Error('description não definido');
		}
		console.log('✓ description existe');
		console.log(`  displayName: "${instance.description.displayName}"`);
		console.log(`  name: "${instance.description.name}"`);
		console.log(`  version: ${instance.description.version}`);
		
		// Verificar credentials
		if (!instance.description.credentials || instance.description.credentials.length === 0) {
			throw new Error('credentials não definido');
		}
		const credName = instance.description.credentials[0].name;
		console.log(`✓ credential: "${credName}"`);
		
		if (credName !== 'imobziApi') {
			throw new Error(`credential deveria ser "imobziApi" mas é "${credName}"`);
		}
		
		// Verificar properties
		if (!instance.description.properties || instance.description.properties.length === 0) {
			throw new Error('properties não definido');
		}
		console.log(`✓ properties: ${instance.description.properties.length} campos`);
		
		// Verificar método execute (para nodes normais)
		if (nodeName !== 'ImobziWebhook') {
			if (typeof instance.execute !== 'function') {
				throw new Error('método execute() não encontrado');
			}
			console.log('✓ método execute() existe');
			
			// TENTAR EXECUTAR
			console.log('\n→ Tentando executar...');
			try {
				const result = await instance.execute.call(mockExecutionContext);
				console.log('✓ EXECUÇÃO BEM SUCEDIDA!');
				console.log(`  Retornou: ${result.length} arrays`);
				console.log(`  Items: ${result[0].length} items`);
				console.log(`  Primeiro item:`, JSON.stringify(result[0][0], null, 2));
			} catch (execError) {
				console.error('✗ ERRO NA EXECUÇÃO:');
				console.error(`  ${execError.message}`);
				console.error(`  Stack:`, execError.stack);
				throw execError;
			}
		} else {
			if (typeof instance.webhook !== 'function') {
				throw new Error('método webhook() não encontrado');
			}
			console.log('✓ método webhook() existe');
		}
		
		console.log(`\n✅ ${nodeName}: TUDO OK!`);
		return true;
		
	} catch (error) {
		console.error(`\n❌ ${nodeName}: ERRO!`);
		console.error(`Erro: ${error.message}`);
		console.error(`Stack:`, error.stack);
		return false;
	}
}

async function main() {
	const results = [];
	
	// Testar ImobziSimples (mais simples)
	try {
		const ImobziSimples = require('./dist/nodes/ImobziSimples/ImobziSimples.node.js').ImobziSimples;
		results.push(await testNode('ImobziSimples', ImobziSimples));
	} catch (error) {
		console.error('Erro ao carregar ImobziSimples:', error.message);
		results.push(false);
	}
	
	// Testar Imobzi (completo)
	try {
		const Imobzi = require('./dist/nodes/Imobzi/Imobzi.node.js').Imobzi;
		results.push(await testNode('Imobzi', Imobzi));
	} catch (error) {
		console.error('Erro ao carregar Imobzi:', error.message);
		results.push(false);
	}
	
	// Testar ImobziWebhook
	try {
		const ImobziWebhook = require('./dist/nodes/ImobziWebhook/ImobziWebhook.node.js').ImobziWebhook;
		results.push(await testNode('ImobziWebhook', ImobziWebhook));
	} catch (error) {
		console.error('Erro ao carregar ImobziWebhook:', error.message);
		results.push(false);
	}
	
	// Resumo
	console.log('\n' + '='.repeat(60));
	console.log('RESUMO');
	console.log('='.repeat(60));
	
	const passed = results.filter(r => r).length;
	const failed = results.filter(r => !r).length;
	
	console.log(`Total: ${results.length} nodes`);
	console.log(`✓ Passou: ${passed}`);
	console.log(`✗ Falhou: ${failed}`);
	
	if (failed === 0) {
		console.log('\n🎉 TODOS OS NODES EXECUTARAM COM SUCESSO!');
		console.log('O código está funcionando perfeitamente!');
		process.exit(0);
	} else {
		console.log('\n❌ ALGUNS NODES FALHARAM!');
		process.exit(1);
	}
}

main().catch(error => {
	console.error('ERRO FATAL:', error);
	process.exit(1);
});

