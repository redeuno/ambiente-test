// Teste simples de carregamento do node
console.log('=== TESTE DE CARREGAMENTO DO NODE ===\n');

// 1. Testar credential
try {
	console.log('1. Carregando ImobziApi.credentials.js...');
	const { ImobziApi } = require('./dist/credentials/ImobziApi.credentials.js');
	const cred = new ImobziApi();
	console.log(`✅ Credential OK: ${cred.name} (${cred.displayName})`);
	console.log(`   Authenticate type: ${cred.authenticate.type}`);
	console.log(`   Test URL: ${cred.test.request.baseURL}${cred.test.request.url}\n`);
} catch (error) {
	console.error(`❌ ERRO ao carregar credential:`, error.message);
	console.error(error.stack);
	process.exit(1);
}

// 2. Testar Imobzi node
try {
	console.log('2. Carregando Imobzi.node.js...');
	const { Imobzi } = require('./dist/nodes/Imobzi/Imobzi.node.js');
	const node = new Imobzi();
	console.log(`✅ Node OK: ${node.description.name} (${node.description.displayName})`);
	console.log(`   Version: ${node.description.version}`);
	console.log(`   Icon: ${node.description.icon}`);
	console.log(`   Group: ${node.description.group}`);
	console.log(`   Inputs: ${node.description.inputs.length}`);
	console.log(`   Outputs: ${node.description.outputs.length}`);
	console.log(`   Has execute(): ${typeof node.execute === 'function'}`);
	
	if (node.methods && node.methods.loadOptions) {
		const methodCount = Object.keys(node.methods.loadOptions).length;
		console.log(`   LoadOptions methods: ${methodCount}`);
	}
	console.log('');
} catch (error) {
	console.error(`❌ ERRO ao carregar Imobzi node:`, error.message);
	console.error(error.stack);
	process.exit(1);
}

// 3. Testar ImobziWebhook node
try {
	console.log('3. Carregando ImobziWebhook.node.js...');
	const { ImobziWebhook } = require('./dist/nodes/ImobziWebhook/ImobziWebhook.node.js');
	const node = new ImobziWebhook();
	console.log(`✅ Webhook OK: ${node.description.name} (${node.description.displayName})`);
	console.log(`   Version: ${node.description.version}`);
	console.log(`   Icon: ${node.description.icon}`);
	console.log(`   Has webhook(): ${typeof node.webhook === 'function'}`);
	console.log('');
} catch (error) {
	console.error(`❌ ERRO ao carregar ImobziWebhook:`, error.message);
	console.error(error.stack);
	process.exit(1);
}

console.log('=== ✅ TODOS OS TESTES PASSARAM! ===');
console.log('O node está estruturalmente correto e pode ser carregado.\n');

