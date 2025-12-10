#!/bin/bash
###############################################################################
# 🔧 SCRIPT AUTOMÁTICO - TENTA TODAS AS SOLUÇÕES
# Este script tenta resolver o problema automaticamente
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🔧 SCRIPT AUTOMÁTICO DE CORREÇÃO - NODE IMOBZI                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

LOG_FILE="resolver-node-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo "Log será salvo em: $LOG_FILE"
echo ""

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar requisitos
echo -e "${BLUE}=== VERIFICANDO REQUISITOS ===${NC}"
echo ""

if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi

if ! command_exists n8n; then
    echo -e "${RED}❌ n8n não encontrado!${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
N8N_VERSION=$(n8n --version 2>/dev/null || echo "unknown")

echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
echo -e "${GREEN}✅ n8n: $N8N_VERSION${NC}"
echo ""

# Verificar versão do Node.js
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js $NODE_VERSION é muito antigo! Recomendado: >= 18${NC}"
    read -p "Continuar mesmo assim? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     INICIANDO CORREÇÃO AUTOMÁTICA                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# TENTATIVA 1: Limpeza completa
echo -e "${YELLOW}[TENTATIVA 1/5] Limpeza completa...${NC}"
echo ""

# Parar n8n
if systemctl is-active --quiet n8n 2>/dev/null; then
    echo "Parando n8n..."
    sudo systemctl stop n8n
elif pgrep -x "n8n" > /dev/null; then
    echo "Parando processos n8n..."
    pkill -9 n8n
fi
sleep 3

# Remover tudo
echo "Removendo instalações antigas..."
rm -rf ~/.n8n/nodes/node_modules/@mantovani.bruno 2>/dev/null || true
rm -rf ~/.n8n/.cache/nodes/@mantovani.bruno 2>/dev/null || true
rm -rf ~/.n8n/.cache/nodes 2>/dev/null || true
npm uninstall -g @mantovani.bruno/n8n-nodes-imobzi-new 2>/dev/null || true

# Limpar cache
echo "Limpando cache..."
npm cache clean --force
npm cache verify

echo -e "${GREEN}✅ Limpeza concluída${NC}"
echo ""

# TENTATIVA 2: Instalação global
echo -e "${YELLOW}[TENTATIVA 2/5] Instalação global...${NC}"
echo ""

if npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0; then
    echo -e "${GREEN}✅ Instalação global OK${NC}"
    
    # Verificar
    if [ -d "$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new" ]; then
        echo -e "${GREEN}✅ Node encontrado em ~/.n8n/nodes/${NC}"
    else
        echo -e "${YELLOW}⚠️  Node não apareceu em ~/.n8n/nodes/, tentando instalação local...${NC}"
    fi
else
    echo -e "${RED}❌ Instalação global falhou, tentando instalação local...${NC}"
fi
echo ""

# TENTATIVA 3: Instalação local forçada
echo -e "${YELLOW}[TENTATIVA 3/5] Instalação local forçada...${NC}"
echo ""

mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes

if [ ! -f package.json ]; then
    echo '{"name":"n8n-custom-nodes","version":"1.0.0","dependencies":{}}' > package.json
fi

npm install --force @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0

if [ -d "node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist" ]; then
    echo -e "${GREEN}✅ Instalação local OK${NC}"
    echo "Arquivos:"
    ls -la node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/
else
    echo -e "${RED}❌ Instalação local falhou${NC}"
fi
echo ""

# TENTATIVA 4: Verificar arquivos
echo -e "${YELLOW}[TENTATIVA 4/5] Verificando arquivos...${NC}"
echo ""

NODE_PATH="$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new"

if [ -d "$NODE_PATH" ]; then
    echo -e "${GREEN}✅ Diretório do node existe${NC}"
    
    # Verificar arquivos críticos
    FILES_OK=true
    
    if [ -f "$NODE_PATH/package.json" ]; then
        VERSION=$(grep '"version"' "$NODE_PATH/package.json" | head -1 | sed 's/.*: "\(.*\)".*/\1/')
        echo -e "${GREEN}✅ package.json existe (v$VERSION)${NC}"
    else
        echo -e "${RED}❌ package.json não encontrado${NC}"
        FILES_OK=false
    fi
    
    if [ -f "$NODE_PATH/dist/nodes/Imobzi/Imobzi.node.js" ]; then
        SIZE=$(wc -c < "$NODE_PATH/dist/nodes/Imobzi/Imobzi.node.js")
        echo -e "${GREEN}✅ Imobzi.node.js existe ($SIZE bytes)${NC}"
    else
        echo -e "${RED}❌ Imobzi.node.js não encontrado${NC}"
        FILES_OK=false
    fi
    
    if [ -f "$NODE_PATH/dist/nodes/ImobziWebhook/ImobziWebhook.node.js" ]; then
        echo -e "${GREEN}✅ ImobziWebhook.node.js existe${NC}"
    else
        echo -e "${RED}❌ ImobziWebhook.node.js não encontrado${NC}"
        FILES_OK=false
    fi
    
    if [ -f "$NODE_PATH/dist/credentials/ImobziApi.credentials.js" ]; then
        echo -e "${GREEN}✅ ImobziApi.credentials.js existe${NC}"
    else
        echo -e "${RED}❌ ImobziApi.credentials.js não encontrado${NC}"
        FILES_OK=false
    fi
    
    if [ "$FILES_OK" = false ]; then
        echo ""
        echo -e "${RED}❌ ALERTA: Arquivos estão faltando! Reinstalando via tarball...${NC}"
        
        # Tentar via tarball
        cd /tmp
        npm pack @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0
        cd ~/.n8n/nodes
        npm install --force /tmp/mantovani.bruno-n8n-nodes-imobzi-new-1.1.0.tgz
    fi
else
    echo -e "${RED}❌ Diretório do node não existe!${NC}"
fi
echo ""

# TENTATIVA 5: Teste de carregamento
echo -e "${YELLOW}[TENTATIVA 5/5] Testando carregamento...${NC}"
echo ""

node -e "
try {
    console.log('Tentando carregar node...');
    const nodePath = '$NODE_PATH/dist/nodes/Imobzi/Imobzi.node.js';
    const node = require(nodePath);
    
    if (node.Imobzi) {
        console.log('✅ Classe Imobzi encontrada');
        const instance = new node.Imobzi();
        console.log('✅ Instanciado com sucesso!');
        console.log('   Nome: ' + instance.description.name);
        console.log('   DisplayName: ' + instance.description.displayName);
        console.log('   Version: ' + instance.description.version);
        process.exit(0);
    } else {
        console.log('❌ Classe Imobzi não encontrada no export');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ ERRO ao carregar:', error.message);
    process.exit(1);
}
"

LOAD_TEST=$?
echo ""

if [ $LOAD_TEST -eq 0 ]; then
    echo -e "${GREEN}✅ Teste de carregamento passou!${NC}"
else
    echo -e "${RED}❌ Teste de carregamento falhou!${NC}"
    echo ""
    echo -e "${YELLOW}Isso indica um problema com os arquivos do pacote.${NC}"
    echo -e "${YELLOW}Possível corrupção durante download.${NC}"
fi
echo ""

# Corrigir permissões
echo -e "${YELLOW}Corrigindo permissões...${NC}"
chmod -R 755 ~/.n8n/nodes 2>/dev/null || true
echo ""

# Reiniciar n8n
echo -e "${BLUE}=== REINICIANDO N8N ===${NC}"
echo ""

if systemctl is-enabled --quiet n8n 2>/dev/null; then
    echo "Reiniciando via systemctl..."
    sudo systemctl start n8n
    sleep 5
    
    if systemctl is-active --quiet n8n; then
        echo -e "${GREEN}✅ n8n está rodando${NC}"
    else
        echo -e "${RED}❌ n8n não iniciou - verifique logs:${NC}"
        echo "   sudo journalctl -u n8n -n 50"
    fi
else
    echo -e "${YELLOW}⚠️  n8n não está configurado via systemctl${NC}"
    echo "   Inicie manualmente: n8n start"
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                         📊 RESULTADO FINAL                                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificação final
if [ -d "$NODE_PATH/dist" ] && [ -f "$NODE_PATH/dist/nodes/Imobzi/Imobzi.node.js" ]; then
    if [ $LOAD_TEST -eq 0 ]; then
        echo -e "${GREEN}✅ SUCESSO! Node instalado e testado!${NC}"
        echo ""
        echo -e "${BLUE}📝 PRÓXIMOS PASSOS:${NC}"
        echo "1. Abra o n8n no navegador"
        echo "2. Crie um novo workflow"
        echo "3. Procure por 'Imobzi' nos nodes"
        echo "4. Configure as credentials"
        echo "5. Teste com 'Get All' → 'Properties'"
        echo ""
        echo -e "${YELLOW}⚠️  Se ainda der erro 'Unrecognized node type':${NC}"
        echo "   1. Limpe cache do navegador (Ctrl+Shift+Del)"
        echo "   2. Reinicie o servidor: ${YELLOW}sudo reboot${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠️  INSTALADO MAS COM PROBLEMAS${NC}"
        echo ""
        echo "Node está instalado mas o teste de carregamento falhou."
        echo "Isso pode indicar:"
        echo "  • Arquivos corrompidos"
        echo "  • Versão do Node.js incompatível"
        echo "  • Problema com dependências"
        echo ""
        echo -e "${YELLOW}SOLUÇÃO: Tente reinstalar n8n completamente${NC}"
    fi
else
    echo -e "${RED}❌ FALHA NA INSTALAÇÃO${NC}"
    echo ""
    echo "O node não foi instalado corretamente."
    echo ""
    echo -e "${BLUE}POSSÍVEIS CAUSAS:${NC}"
    echo "  • Problema de rede (firewall/proxy)"
    echo "  • Versão do npm muito antiga"
    echo "  • Permissões insuficientes"
    echo "  • Problema com registro npm"
    echo ""
    echo -e "${BLUE}TENTE:${NC}"
    echo "  1. Atualizar npm: ${YELLOW}npm install -g npm@latest${NC}"
    echo "  2. Verificar conexão: ${YELLOW}curl https://registry.npmjs.org${NC}"
    echo "  3. Testar localmente primeiro"
fi

echo ""
echo -e "${BLUE}Log completo salvo em: ${YELLOW}$LOG_FILE${NC}"
echo ""
echo -e "${YELLOW}Se ainda tiver problemas, me envie o conteúdo de:${NC}"
echo "  cat $LOG_FILE"
echo ""

