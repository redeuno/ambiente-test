#!/usr/bin/env node
/**
 * 🔍 DIAGNÓSTICO COMPLETO DO NODE IMOBZI
 * 
 * Este script testa se o node pode ser carregado corretamente pelo n8n
 */

const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║              🔍 DIAGNÓSTICO COMPLETO DO NODE IMOBZI                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

// Cores para output
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
	const exists = fs.existsSync(filePath);
	if (exists) {
		const stats = fs.statSync(filePath);
		log(`✅ ${description}: ${filePath} (${stats.size} bytes)`, 'green');
		return true;
	} else {
		log(`❌ ${description}: ${filePath} NÃO ENCONTRADO`, 'red');
		return false;
	}
}

let errors = 0;
let warnings = 0;

console.log('═══ VERIFICAÇÃO 1: Estrutura de Arquivos ═══\n');

// Verificar package.json
if (checkFile('package.json', 'package.json raiz')) {
	const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	log(`   Nome: ${pkg.name}`, 'cyan');
	log(`   Versão: ${pkg.version}`, 'cyan');
	log(`   Main: ${pkg.main}`, 'cyan');
	
	if (pkg.n8n) {
		log(`   n8nNodesApiVersion: ${pkg.n8n.n8nNodesApiVersion}`, 'cyan');
		log(`   Credentials: ${pkg.n8n.credentials.length}`, 'cyan');
		log(`   Nodes: ${pkg.n8n.nodes.length}`, 'cyan');
	}
} else {
	errors++;
}

console.log('');

// Verificar index.js
if (!checkFile('index.js', 'index.js')) {
	errors++;
}

console.log('');

// Verificar dist/
if (!fs.existsSync('dist')) {
	log('❌ Pasta dist/ não encontrada! Execute: npm run build', 'red');
	errors++;
	process.exit(1);
}

console.log('═══ VERIFICAÇÃO 2: Arquivos Compilados ═══\n');

const requiredFiles = [
	'dist/credentials/ImobziApi.credentials.js',
	'dist/nodes/Imobzi/Imobzi.node.js',
	'dist/nodes/ImobziWebhook/ImobziWebhook.node.js',
];

requiredFiles.forEach(file => {
	if (!checkFile(file, path.basename(file))) {
		errors++;
	}
});

console.log('');

console.log('═══ VERIFICAÇÃO 3: Arquivos SVG (Logos) ═══\n');

const svgFiles = [
	'dist/nodes/Imobzi/imobzi.svg',
	'dist/nodes/ImobziWebhook/imobzi.svg',
];

svgFiles.forEach(file => {
	if (!checkFile(file, path.basename(file))) {
		warnings++;
	}
});

console.log('');

console.log('═══ VERIFICAÇÃO 4: Carregamento do Node ═══\n');

try {
	log('Tentando carregar: ImobziApi.credentials.js...', 'yellow');
	const ImobziApi = require('./dist/credentials/ImobziApi.credentials.js');
	
	if (ImobziApi.ImobziApi) {
		const cred = new ImobziApi.ImobziApi();
		log(`✅ Credential carregada: ${cred.name} (${cred.displayName})`, 'green');
	} else {
		log('❌ ImobziApi.credentials.js não exporta ImobziApi', 'red');
		errors++;
	}
} catch (error) {
	log(`❌ Erro ao carregar credential: ${error.message}`, 'red');
	log(`   Stack: ${error.stack}`, 'red');
	errors++;
}

console.log('');

try {
	log('Tentando carregar: Imobzi.node.js...', 'yellow');
	const ImobziNode = require('./dist/nodes/Imobzi/Imobzi.node.js');
	
	if (ImobziNode.Imobzi) {
		const node = new ImobziNode.Imobzi();
		log(`✅ Node carregado: ${node.description.name} (${node.description.displayName})`, 'green');
		log(`   Versão: ${node.description.version}`, 'cyan');
		log(`   Icon: ${node.description.icon}`, 'cyan');
		log(`   Group: ${node.description.group}`, 'cyan');
		
		// Verificar se tem métodos
		if (node.methods && node.methods.loadOptions) {
			const methodCount = Object.keys(node.methods.loadOptions).length;
			log(`   LoadOptions Methods: ${methodCount}`, 'cyan');
		}
		
		// Verificar se tem execute
		if (typeof node.execute === 'function') {
			log(`   ✅ Método execute() presente`, 'green');
		} else {
			log(`   ❌ Método execute() AUSENTE`, 'red');
			errors++;
		}
	} else {
		log('❌ Imobzi.node.js não exporta Imobzi', 'red');
		errors++;
	}
} catch (error) {
	log(`❌ Erro ao carregar node: ${error.message}`, 'red');
	log(`   Stack: ${error.stack}`, 'red');
	errors++;
}

console.log('');

try {
	log('Tentando carregar: ImobziWebhook.node.js...', 'yellow');
	const ImobziWebhookNode = require('./dist/nodes/ImobziWebhook/ImobziWebhook.node.js');
	
	if (ImobziWebhookNode.ImobziWebhook) {
		const node = new ImobziWebhookNode.ImobziWebhook();
		log(`✅ Webhook carregado: ${node.description.name} (${node.description.displayName})`, 'green');
		log(`   Icon: ${node.description.icon}`, 'cyan');
		
		// Verificar se tem webhook
		if (typeof node.webhook === 'function') {
			log(`   ✅ Método webhook() presente`, 'green');
		} else {
			log(`   ❌ Método webhook() AUSENTE`, 'red');
			errors++;
		}
	} else {
		log('❌ ImobziWebhook.node.js não exporta ImobziWebhook', 'red');
		errors++;
	}
} catch (error) {
	log(`❌ Erro ao carregar webhook: ${error.message}`, 'red');
	log(`   Stack: ${error.stack}`, 'red');
	errors++;
}

console.log('');

console.log('═══ VERIFICAÇÃO 5: package.json vs Arquivos ═══\n');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (pkg.n8n) {
	// Verificar credentials
	pkg.n8n.credentials.forEach(credPath => {
		if (fs.existsSync(credPath)) {
			log(`✅ Credential declarada existe: ${credPath}`, 'green');
		} else {
			log(`❌ Credential declarada NÃO existe: ${credPath}`, 'red');
			errors++;
		}
	});
	
	// Verificar nodes
	pkg.n8n.nodes.forEach(nodePath => {
		if (fs.existsSync(nodePath)) {
			log(`✅ Node declarado existe: ${nodePath}`, 'green');
		} else {
			log(`❌ Node declarado NÃO existe: ${nodePath}`, 'red');
			errors++;
		}
	});
}

console.log('');

console.log('═══ VERIFICAÇÃO 6: Tamanho dos Arquivos ═══\n');

function checkFileSize(filePath, maxSize, description) {
	if (fs.existsSync(filePath)) {
		const stats = fs.statSync(filePath);
		const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
		
		if (stats.size > maxSize) {
			log(`⚠️  ${description}: ${sizeMB}MB (muito grande!)`, 'yellow');
			warnings++;
		} else {
			log(`✅ ${description}: ${sizeMB}MB`, 'green');
		}
	}
}

checkFileSize('dist/nodes/Imobzi/Imobzi.node.js', 500 * 1024, 'Imobzi.node.js');
checkFileSize('dist/nodes/ImobziWebhook/ImobziWebhook.node.js', 50 * 1024, 'ImobziWebhook.node.js');

console.log('');

console.log('═══ VERIFICAÇÃO 7: Teste de Empacotamento ═══\n');

const filesInPackage = pkg.files || [];
log(`Files no package.json: ${filesInPackage.join(', ')}`, 'cyan');

// Verificar se todos os files existem
filesInPackage.forEach(file => {
	if (fs.existsSync(file)) {
		if (fs.statSync(file).isDirectory()) {
			log(`✅ Diretório incluído: ${file}/`, 'green');
		} else {
			log(`✅ Arquivo incluído: ${file}`, 'green');
		}
	} else {
		log(`❌ Arquivo/Diretório não existe: ${file}`, 'red');
		errors++;
	}
});

console.log('');

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                           📊 RESUMO DO DIAGNÓSTICO                           ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

if (errors === 0 && warnings === 0) {
	log('🎉 PERFEITO! Nenhum erro ou aviso encontrado!', 'green');
	log('✅ O node está pronto para ser publicado!', 'green');
	process.exit(0);
} else if (errors === 0 && warnings > 0) {
	log(`⚠️  ${warnings} aviso(s) encontrado(s), mas nenhum erro crítico.`, 'yellow');
	log('✅ O node deve funcionar, mas há pontos de atenção.', 'yellow');
	process.exit(0);
} else {
	log(`❌ ${errors} erro(s) crítico(s) encontrado(s)!`, 'red');
	log(`⚠️  ${warnings} aviso(s) encontrado(s).`, 'yellow');
	log('❌ O node NÃO está pronto para ser publicado.', 'red');
	log('\n💡 Corrija os erros acima antes de continuar.', 'yellow');
	process.exit(1);
}

