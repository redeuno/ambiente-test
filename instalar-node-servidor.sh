#!/bin/bash
###############################################################################
# 📦 SCRIPT DE INSTALAÇÃO DO NODE IMOBZI NO SERVIDOR N8N
###############################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         📦 INSTALAÇÃO DO NODE IMOBZI - SERVIDOR N8N                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se n8n existe
if ! command -v n8n &> /dev/null; then
    echo -e "${RED}❌ n8n não encontrado!${NC}"
    exit 1
fi

N8N_VERSION=$(n8n --version 2>/dev/null || echo "unknown")
echo -e "${GREEN}✅ n8n encontrado: ${N8N_VERSION}${NC}"
echo ""

# Verificar se o node já está instalado
if [ -d "$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new" ]; then
    echo -e "${YELLOW}⚠️  O node Imobzi já está instalado!${NC}"
    read -p "Deseja reinstalar? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
        echo -e "${RED}❌ Instalação cancelada${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Desinstalando versão antiga...${NC}"
    rm -rf "$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new"
fi

echo -e "${BLUE}═══ Instalando node Imobzi v1.1.0 ═══${NC}"
echo ""

# Método 1: Tentar instalação global
echo -e "${YELLOW}Método 1: Instalação global via npm...${NC}"
if npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0; then
    echo -e "${GREEN}✅ Instalação global concluída${NC}"
else
    echo -e "${RED}❌ Instalação global falhou${NC}"
    echo -e "${YELLOW}Tentando método alternativo...${NC}"
    
    # Método 2: Instalação local
    mkdir -p "$HOME/.n8n/nodes"
    cd "$HOME/.n8n/nodes"
    
    if [ ! -f "package.json" ]; then
        echo '{"name":"n8n-custom-nodes","version":"1.0.0","dependencies":{}}' > package.json
    fi
    
    npm install @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0
fi

echo ""
echo -e "${BLUE}═══ Verificando instalação ═══${NC}"

if [ -d "$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new" ]; then
    echo -e "${GREEN}✅ Node instalado em: ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new${NC}"
    
    # Verificar arquivos
    NODE_PATH="$HOME/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new"
    
    if [ -f "$NODE_PATH/package.json" ]; then
        VERSION=$(grep '"version"' "$NODE_PATH/package.json" | head -1 | sed 's/.*: "\(.*\)".*/\1/')
        echo -e "${GREEN}✅ Versão instalada: ${VERSION}${NC}"
    fi
    
    if [ -d "$NODE_PATH/dist" ]; then
        echo -e "${GREEN}✅ Pasta dist/ encontrada${NC}"
        
        if [ -f "$NODE_PATH/dist/nodes/Imobzi/Imobzi.node.js" ]; then
            echo -e "${GREEN}✅ Imobzi.node.js encontrado${NC}"
        else
            echo -e "${RED}❌ Imobzi.node.js NÃO encontrado${NC}"
        fi
        
        if [ -f "$NODE_PATH/dist/nodes/ImobziWebhook/ImobziWebhook.node.js" ]; then
            echo -e "${GREEN}✅ ImobziWebhook.node.js encontrado${NC}"
        else
            echo -e "${RED}❌ ImobziWebhook.node.js NÃO encontrado${NC}"
        fi
        
        if [ -f "$NODE_PATH/dist/credentials/ImobziApi.credentials.js" ]; then
            echo -e "${GREEN}✅ ImobziApi.credentials.js encontrado${NC}"
        else
            echo -e "${RED}❌ ImobziApi.credentials.js NÃO encontrado${NC}"
        fi
    else
        echo -e "${RED}❌ Pasta dist/ NÃO encontrada - pacote pode estar corrompido${NC}"
    fi
else
    echo -e "${RED}❌ Instalação FALHOU - node não encontrado${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══ Reiniciando n8n ═══${NC}"

if systemctl is-active --quiet n8n 2>/dev/null; then
    echo -e "${YELLOW}Reiniciando n8n via systemctl...${NC}"
    sudo systemctl restart n8n
    echo -e "${GREEN}✅ n8n reiniciado${NC}"
    
    echo ""
    echo -e "${YELLOW}Aguardando n8n inicializar (10 segundos)...${NC}"
    sleep 10
    
    if systemctl is-active --quiet n8n 2>/dev/null; then
        echo -e "${GREEN}✅ n8n está rodando${NC}"
    else
        echo -e "${RED}❌ n8n não está rodando - verifique os logs:${NC}"
        echo -e "   ${YELLOW}sudo journalctl -u n8n -f${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  n8n não está rodando via systemctl${NC}"
    echo -e "${YELLOW}   Inicie manualmente: sudo systemctl start n8n${NC}"
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                         ✅ INSTALAÇÃO CONCLUÍDA!                             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📝 PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1️⃣  Abra o n8n no navegador"
echo "2️⃣  Crie um novo workflow"
echo "3️⃣  Procure por '${YELLOW}Imobzi${NC}' nos nodes"
echo "4️⃣  Adicione o node '${YELLOW}Imobzi${NC}' ou '${YELLOW}Imobzi Webhook${NC}'"
echo "5️⃣  Configure as credentials com sua API Key"
echo "6️⃣  Teste com operação '${YELLOW}Get All${NC}' → '${YELLOW}Properties${NC}'"
echo ""
echo -e "${YELLOW}⚠️  Se ainda der erro 'Unrecognized node type':${NC}"
echo "   1. Limpe cache do navegador (Ctrl+Shift+Del)"
echo "   2. Feche e abra o n8n novamente"
echo "   3. Execute: ${YELLOW}sudo systemctl restart n8n${NC}"
echo "   4. Se persistir, execute ${YELLOW}./limpar-servidor.sh${NC} novamente"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "   • API Imobzi: ${YELLOW}https://developer.imobzi.com/${NC}"
echo "   • README: ${YELLOW}https://github.com/redeuno/imobzi-new${NC}"
echo ""

