#!/bin/bash
###############################################################################
# 🔍 SCRIPT PARA COLETAR INFORMAÇÕES DO SERVIDOR
# Execute este script e me envie o resultado completo
###############################################################################

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║              🔍 COLETANDO INFORMAÇÕES DO SERVIDOR N8N                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

OUTPUT_FILE="debug-n8n-$(date +%Y%m%d-%H%M%S).txt"

{
echo "=== INFORMAÇÕES DO SISTEMA ==="
echo ""
echo "Data/Hora: $(date)"
echo "Hostname: $(hostname)"
echo "SO: $(uname -a)"
echo ""

echo "=== VERSÕES ==="
echo ""
echo "Node.js:"
node --version
echo ""
echo "npm:"
npm --version
echo ""
echo "n8n:"
n8n --version 2>&1 || echo "n8n não encontrado no PATH"
echo ""

echo "=== STATUS DO N8N ==="
echo ""
systemctl status n8n 2>&1 || echo "n8n não está rodando via systemctl"
echo ""

echo "=== NODE IMOBZI - INSTALAÇÃO GLOBAL ==="
echo ""
echo "npm list global:"
npm list -g @mantovani.bruno/n8n-nodes-imobzi-new 2>&1 || echo "Não instalado globalmente"
echo ""

echo "=== NODE IMOBZI - ARQUIVOS NO SERVIDOR ==="
echo ""
echo "Verificando ~/.n8n/nodes/node_modules/@mantovani.bruno/:"
ls -la ~/.n8n/nodes/node_modules/@mantovani.bruno/ 2>&1 || echo "Diretório não existe"
echo ""

echo "Verificando ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/:"
ls -la ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/ 2>&1 || echo "Diretório não existe"
echo ""

echo "Verificando dist/:"
ls -la ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/ 2>&1 || echo "Diretório dist não existe"
echo ""

echo "Verificando dist/nodes/:"
ls -la ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/ 2>&1 || echo "Diretório dist/nodes não existe"
echo ""

echo "=== PACKAGE.JSON DO NODE ==="
echo ""
if [ -f ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/package.json ]; then
    cat ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/package.json
else
    echo "package.json não encontrado"
fi
echo ""

echo "=== VERIFICAR SE ARQUIVOS .JS EXISTEM ==="
echo ""
echo "Imobzi.node.js:"
if [ -f ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/Imobzi/Imobzi.node.js ]; then
    echo "✅ EXISTE ($(wc -c < ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/Imobzi/Imobzi.node.js) bytes)"
    echo "Primeiras 20 linhas:"
    head -20 ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/Imobzi/Imobzi.node.js
else
    echo "❌ NÃO EXISTE"
fi
echo ""

echo "ImobziWebhook.node.js:"
if [ -f ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/ImobziWebhook/ImobziWebhook.node.js ]; then
    echo "✅ EXISTE ($(wc -c < ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/ImobziWebhook/ImobziWebhook.node.js) bytes)"
else
    echo "❌ NÃO EXISTE"
fi
echo ""

echo "ImobziApi.credentials.js:"
if [ -f ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/credentials/ImobziApi.credentials.js ]; then
    echo "✅ EXISTE ($(wc -c < ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/credentials/ImobziApi.credentials.js) bytes)"
else
    echo "❌ NÃO EXISTE"
fi
echo ""

echo "=== LOGS DO N8N (ÚLTIMAS 100 LINHAS) ==="
echo ""
sudo journalctl -u n8n -n 100 --no-pager 2>&1 || echo "Não foi possível acessar logs via journalctl"
echo ""

echo "=== LOGS DO N8N (ARQUIVO DE LOG) ==="
echo ""
if [ -f ~/.n8n/logs/n8n.log ]; then
    echo "Últimas 100 linhas de ~/.n8n/logs/n8n.log:"
    tail -100 ~/.n8n/logs/n8n.log
else
    echo "Arquivo de log não encontrado em ~/.n8n/logs/n8n.log"
fi
echo ""

echo "=== PROCESSOS N8N RODANDO ==="
echo ""
ps aux | grep n8n | grep -v grep
echo ""

echo "=== PORTAS ABERTAS (N8N) ==="
echo ""
sudo netstat -tulpn | grep n8n 2>&1 || ss -tulpn | grep n8n 2>&1 || echo "Não foi possível verificar portas"
echo ""

echo "=== VARIÁVEIS DE AMBIENTE N8N ==="
echo ""
if systemctl show n8n -p Environment --no-pager 2>/dev/null; then
    echo "Variáveis via systemctl:"
    systemctl show n8n -p Environment --no-pager
else
    echo "Não foi possível obter via systemctl"
fi
echo ""

echo "=== TESTE DE CARREGAMENTO DO NODE ==="
echo ""
echo "Tentando carregar o node com Node.js:"
node -e "
try {
    console.log('Tentando carregar credential...');
    const cred = require('$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/credentials/ImobziApi.credentials.js');
    console.log('✅ Credential carregada:', Object.keys(cred));
    
    console.log('\\nTentando carregar Imobzi node...');
    const node = require('$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/Imobzi/Imobzi.node.js');
    console.log('✅ Node carregado:', Object.keys(node));
    
    console.log('\\nTentando instanciar...');
    if (node.Imobzi) {
        const instance = new node.Imobzi();
        console.log('✅ Instanciado com sucesso!');
        console.log('   Nome:', instance.description.name);
        console.log('   DisplayName:', instance.description.displayName);
        console.log('   Version:', instance.description.version);
    } else {
        console.log('❌ Classe Imobzi não encontrada no export');
    }
} catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
}
" 2>&1 || echo "Erro ao executar teste"
echo ""

echo "=== PERMISSÕES DOS ARQUIVOS ==="
echo ""
echo "Permissões do diretório do node:"
ls -la ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/ 2>&1 || echo "Diretório não existe"
echo ""

echo "=== CACHE DO N8N ==="
echo ""
echo "Verificando cache:"
ls -la ~/.n8n/.cache/ 2>&1 || echo "Diretório de cache não existe"
echo ""

echo "=== COMMUNITY NODES INSTALADOS ==="
echo ""
if [ -f ~/.n8n/config ]; then
    echo "Config do n8n:"
    cat ~/.n8n/config 2>&1
else
    echo "Arquivo config não encontrado"
fi
echo ""

echo "Todos os nodes instalados:"
ls -la ~/.n8n/nodes/node_modules/ 2>&1 || echo "Diretório node_modules não existe"
echo ""

} | tee "$OUTPUT_FILE"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ INFORMAÇÕES COLETADAS!                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Arquivo criado: $OUTPUT_FILE"
echo ""
echo "📋 ENVIE TODO O CONTEÚDO DESTE ARQUIVO:"
echo ""
echo "Opção 1 - Copiar conteúdo:"
echo "   cat $OUTPUT_FILE"
echo ""
echo "Opção 2 - Download (se tiver acesso web):"
echo "   scp usuario@servidor:~/$OUTPUT_FILE ."
echo ""
echo "🚨 IMPORTANTE: Envie TODO o conteúdo do arquivo!"
echo ""

