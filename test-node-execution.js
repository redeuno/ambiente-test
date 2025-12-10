#!/usr/bin/env node

/**
 * TESTE DE EXECUÇÃO COMPLETO
 * Testa se os nodes carregam e executam corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('TESTE DE EXECUÇÃO - NODE IMOBZI');
console.log('='.repeat(80));
console.log();

let errors = [];
let warnings = [];

// Cores
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
};

function log(msg, color = 'reset') {
	console.log(`${colors[color]}${msg}${colors.reset}`);
}

function error(msg) {
	errors.push(msg);
	log(`✗ ${msg}`, 'red');
}

function warning(msg) {
	warnings.push(msg);
	log(`⚠ ${msg}`, 'yellow');
}

function success(msg) {
	log(`✓ ${msg}`, 'green');
}

// ============================================================================
// TESTE 1: Carregar package.json
// ============================================================================
log('\n1. VERIFICANDO PACKAGE.JSON', 'blue');
log('-'.repeat(80));

let packageJson;
try {
	packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	success('package.json carregado');
	
	// Verificar campos críticos
	if (!packageJson.n8n) {
		error('Campo "n8n" não existe no package.json');
	} else {
		success('Campo "n8n" encontrado');
		
		if (!packageJson.n8n.nodes || packageJson.n8n.nodes.length === 0) {
			error('Nenhum node definido em "n8n.nodes"');
		} else {
			success(`${packageJson.n8n.nodes.length} nodes definidos`);
			packageJson.n8n.nodes.forEach(node => {
				log(`  → ${node}`, 'yellow');
			});
		}
		
		if (!packageJson.n8n.credentials || packageJson.n8n.credentials.length === 0) {
			error('Nenhuma credential definida em "n8n.credentials"');
		} else {
			success(`${packageJson.n8n.credentials.length} credentials definidas`);
		}
	}
} catch (err) {
	error(`Erro ao ler package.json: ${err.message}`);
	process.exit(1);
}

// ============================================================================
// TESTE 2: Carregar e instanciar credentials
// ============================================================================
log('\n2. TESTANDO CREDENTIALS', 'blue');
log('-'.repeat(80));

let ImobziApi;
try {
	ImobziApi = require('./dist/credentials/ImobziApi.credentials.js').ImobziApi;
	success('ImobziApi carregada');
	
	const credInstance = new ImobziApi();
	success('ImobziApi instanciada');
	
	// Verificar estrutura
	if (!credInstance.name) error('credential.name não definido');
	else success(`credential.name = "${credInstance.name}"`);
	
	if (!credInstance.displayName) error('credential.displayName não definido');
	else success(`credential.displayName = "${credInstance.displayName}"`);
	
	if (!credInstance.properties) error('credential.properties não definido');
	else success(`credential.properties definido (${credInstance.properties.length} campos)`);
	
	if (!credInstance.authenticate) error('credential.authenticate não definido');
	else success('credential.authenticate definido');
	
	// Verificar se o nome da credential bate com o usado nos nodes
	const expectedCredName = 'imobziApi';
	if (credInstance.name !== expectedCredName) {
		error(`credential.name deveria ser "${expectedCredName}" mas é "${credInstance.name}"`);
	}
	
} catch (err) {
	error(`Erro ao carregar credential: ${err.message}`);
	console.error(err.stack);
}

// ============================================================================
// TESTE 3: Carregar e validar cada node
// ============================================================================
log('\n3. TESTANDO NODES', 'blue');
log('-'.repeat(80));

const nodes = [
	{ name: 'Imobzi', file: './dist/nodes/Imobzi/Imobzi.node.js', expectedName: 'imobzi' },
	{ name: 'ImobziSimples', file: './dist/nodes/ImobziSimples/ImobziSimples.node.js', expectedName: 'imobziSimples' },
	{ name: 'ImobziWebhook', file: './dist/nodes/ImobziWebhook/ImobziWebhook.node.js', expectedName: 'imobziWebhook' },
];

nodes.forEach(({ name, file, expectedName }) => {
	log(`\n  → Testando ${name}:`, 'yellow');
	
	try {
		// Carregar
		const NodeClass = require(file)[name];
		if (!NodeClass) {
			error(`  ${name}: Classe não exportada corretamente`);
			return;
		}
		success(`  ${name}: Classe carregada`);
		
		// Instanciar
		const instance = new NodeClass();
		success(`  ${name}: Instância criada`);
		
		// Verificar description
		if (!instance.description) {
			error(`  ${name}: description não definido`);
			return;
		}
		
		// Verificar campos obrigatórios
		const desc = instance.description;
		
		if (!desc.displayName) error(`  ${name}: description.displayName não definido`);
		else success(`  ${name}: displayName = "${desc.displayName}"`);
		
		if (!desc.name) {
			error(`  ${name}: description.name não definido`);
		} else {
			if (desc.name !== expectedName) {
				error(`  ${name}: description.name deveria ser "${expectedName}" mas é "${desc.name}"`);
			} else {
				success(`  ${name}: name = "${desc.name}" ✓`);
			}
		}
		
		if (!desc.version) error(`  ${name}: description.version não definido`);
		else success(`  ${name}: version = ${desc.version}`);
		
		if (!desc.credentials) {
			error(`  ${name}: description.credentials não definido`);
		} else {
			const credName = desc.credentials[0]?.name;
			if (credName !== 'imobziApi') {
				error(`  ${name}: credential deveria ser "imobziApi" mas é "${credName}"`);
			} else {
				success(`  ${name}: credential = "${credName}" ✓`);
			}
		}
		
		if (!desc.properties) error(`  ${name}: description.properties não definido`);
		else success(`  ${name}: properties definido (${desc.properties.length} campos)`);
		
		// Verificar método execute/webhook
		if (name === 'ImobziWebhook') {
			if (typeof instance.webhook !== 'function') {
				error(`  ${name}: método webhook() não definido`);
			} else {
				success(`  ${name}: método webhook() definido`);
			}
		} else {
			if (typeof instance.execute !== 'function') {
				error(`  ${name}: método execute() não definido`);
			} else {
				success(`  ${name}: método execute() definido`);
			}
		}
		
		// Verificar inputs/outputs
		if (!desc.inputs) error(`  ${name}: description.inputs não definido`);
		if (!desc.outputs) error(`  ${name}: description.outputs não definido`);
		
	} catch (err) {
		error(`  ${name}: Erro ao carregar - ${err.message}`);
		console.error(err.stack);
	}
});

// ============================================================================
// TESTE 4: Verificar package.json do dist
// ============================================================================
log('\n4. VERIFICANDO DIST/PACKAGE.JSON', 'blue');
log('-'.repeat(80));

try {
	const distPackage = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
	success('dist/package.json existe');
	
	if (distPackage.name !== packageJson.name) {
		warning(`Nome diferente: "${distPackage.name}" vs "${packageJson.name}"`);
	}
	
	if (distPackage.version !== packageJson.version) {
		warning(`Versão diferente: "${distPackage.version}" vs "${packageJson.version}"`);
	}
	
} catch (err) {
	warning('dist/package.json não encontrado (isso pode ser ok)');
}

// ============================================================================
// RELATÓRIO FINAL
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('RELATÓRIO FINAL', 'blue');
log('='.repeat(80), 'blue');

if (errors.length === 0) {
	log('\n🎉 NENHUM ERRO ENCONTRADO!', 'green');
	log('O código está correto. O problema deve ser na instalação/cache do servidor.', 'green');
	process.exit(0);
} else {
	log(`\n❌ ${errors.length} ERRO(S) ENCONTRADO(S):`, 'red');
	errors.forEach((err, i) => {
		log(`${i + 1}. ${err}`, 'red');
	});
}

if (warnings.length > 0) {
	log(`\n⚠️  ${warnings.length} AVISO(S):`, 'yellow');
	warnings.forEach((warn, i) => {
		log(`${i + 1}. ${warn}`, 'yellow');
	});
}

log('\n');
process.exit(errors.length > 0 ? 1 : 0);

