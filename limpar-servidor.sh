#!/bin/bash
###############################################################################
# 🧹 SCRIPT DE LIMPEZA COMPLETA DO NODE IMOBZI NO SERVIDOR N8N
###############################################################################

set -e  # Parar em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🧹 LIMPEZA COMPLETA DO NODE IMOBZI - SERVIDOR N8N                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está rodando como usuário correto
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ NÃO execute este script como root!${NC}"
   echo -e "${YELLOW}   Execute como usuário normal que roda o n8n${NC}"
   exit 1
fi

# Confirmar ação
echo -e "${YELLOW}⚠️  ATENÇÃO: Este script vai:${NC}"
echo "   1. Desinstalar o node Imobzi"
echo "   2. Parar o n8n"
echo "   3. Limpar cache e arquivos antigos"
echo "   4. Preparar para reinstalação"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${RED}❌ Operação cancelada${NC}"
    exit 1
fi

echo ""

# PASSO 1: Verificar versão do n8n
echo -e "${BLUE}═══ PASSO 1: Verificando versão do n8n ═══${NC}"
if command -v n8n &> /dev/null; then
    N8N_VERSION=$(n8n --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✅ n8n encontrado: ${N8N_VERSION}${NC}"
else
    echo -e "${RED}❌ n8n não encontrado no PATH!${NC}"
    exit 1
fi
echo ""

# PASSO 2: Backup de workflows (opcional mas recomendado)
echo -e "${BLUE}═══ PASSO 2: Backup de Workflows ═══${NC}"
read -p "Deseja fazer backup dos workflows? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    BACKUP_FILE="$HOME/n8n-workflows-backup-$(date +%Y%m%d-%H%M%S).json"
    echo -e "${YELLOW}Criando backup em: ${BACKUP_FILE}${NC}"
    n8n export:workflow --all --output="$BACKUP_FILE" 2>/dev/null || echo -e "${YELLOW}⚠️  Não foi possível fazer backup (n8n pode estar parado)${NC}"
    echo -e "${GREEN}✅ Backup concluído (se n8n estava rodando)${NC}"
fi
echo ""

# PASSO 3: Parar n8n
echo -e "${BLUE}═══ PASSO 3: Parando n8n ═══${NC}"

# Tentar parar via systemd
if systemctl is-active --quiet n8n 2>/dev/null; then
    echo -e "${YELLOW}Parando n8n via systemctl...${NC}"
    sudo systemctl stop n8n
    echo -e "${GREEN}✅ n8n parado via systemctl${NC}"
elif pgrep -x "n8n" > /dev/null; then
    echo -e "${YELLOW}Parando processos n8n...${NC}"
    pkill -9 n8n
    echo -e "${GREEN}✅ Processos n8n parados${NC}"
else
    echo -e "${YELLOW}⚠️  n8n não estava rodando${NC}"
fi
echo ""

# PASSO 4: Remover node instalado
echo -e "${BLUE}═══ PASSO 4: Removendo node antigo ═══${NC}"

# Remover de ~/.n8n/nodes
if [ -d "$HOME/.n8n/nodes/node_modules/@mantovani.bruno" ]; then
    echo -e "${YELLOW}Removendo: ~/.n8n/nodes/node_modules/@mantovani.bruno${NC}"
    rm -rf "$HOME/.n8n/nodes/node_modules/@mantovani.bruno"
    echo -e "${GREEN}✅ Removido${NC}"
fi

# Remover do cache
if [ -d "$HOME/.n8n/.cache/nodes/@mantovani.bruno" ]; then
    echo -e "${YELLOW}Removendo: ~/.n8n/.cache/nodes/@mantovani.bruno${NC}"
    rm -rf "$HOME/.n8n/.cache/nodes/@mantovani.bruno"
    echo -e "${GREEN}✅ Removido do cache${NC}"
fi

# Remover de instalação global npm (se existir)
if npm list -g @mantovani.bruno/n8n-nodes-imobzi-new &> /dev/null; then
    echo -e "${YELLOW}Removendo instalação global npm...${NC}"
    npm uninstall -g @mantovani.bruno/n8n-nodes-imobzi-new
    echo -e "${GREEN}✅ Removido do npm global${NC}"
fi

echo ""

# PASSO 5: Limpar cache npm
echo -e "${BLUE}═══ PASSO 5: Limpando cache npm ═══${NC}"
npm cache clean --force
echo -e "${GREEN}✅ Cache npm limpo${NC}"
echo ""

# PASSO 6: Limpar node_modules do n8n (opcional)
echo -e "${BLUE}═══ PASSO 6: Limpar node_modules do n8n? ═══${NC}"
echo -e "${YELLOW}⚠️  Isso pode resolver problemas de dependências corrompidas${NC}"
read -p "Deseja limpar node_modules do n8n? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    if [ -d "$HOME/.n8n/nodes/node_modules" ]; then
        echo -e "${YELLOW}Removendo node_modules...${NC}"
        rm -rf "$HOME/.n8n/nodes/node_modules"
        
        # Recriar estrutura
        mkdir -p "$HOME/.n8n/nodes"
        cd "$HOME/.n8n/nodes"
        
        # Se existe package.json, reinstalar
        if [ -f "package.json" ]; then
            npm install
        fi
        
        echo -e "${GREEN}✅ node_modules limpo e recriado${NC}"
    fi
fi
echo ""

# PASSO 7: Verificar limpeza
echo -e "${BLUE}═══ PASSO 7: Verificando limpeza ═══${NC}"

FOUND_ISSUES=0

if [ -d "$HOME/.n8n/nodes/node_modules/@mantovani.bruno" ]; then
    echo -e "${RED}❌ Ainda existe: ~/.n8n/nodes/node_modules/@mantovani.bruno${NC}"
    FOUND_ISSUES=1
else
    echo -e "${GREEN}✅ Node removido corretamente${NC}"
fi

if [ -d "$HOME/.n8n/.cache/nodes/@mantovani.bruno" ]; then
    echo -e "${RED}❌ Ainda existe cache${NC}"
    FOUND_ISSUES=1
else
    echo -e "${GREEN}✅ Cache removido corretamente${NC}"
fi

echo ""

# RESULTADO FINAL
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                           📊 RESULTADO DA LIMPEZA                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ LIMPEZA CONCLUÍDA COM SUCESSO!${NC}"
    echo ""
    echo -e "${BLUE}📝 PRÓXIMOS PASSOS:${NC}"
    echo ""
    echo "1️⃣  Reiniciar o servidor (RECOMENDADO):"
    echo "   ${YELLOW}sudo reboot${NC}"
    echo ""
    echo "2️⃣  OU reiniciar apenas o n8n:"
    echo "   ${YELLOW}sudo systemctl start n8n${NC}"
    echo ""
    echo "3️⃣  Após reiniciar, instalar o node novamente:"
    echo ""
    echo "   ${GREEN}OPÇÃO A - Via UI do n8n (RECOMENDADO):${NC}"
    echo "   • Abra n8n no navegador"
    echo "   • Settings > Community Nodes"
    echo "   • Instalar: ${YELLOW}@mantovani.bruno/n8n-nodes-imobzi-new@1.1.0${NC}"
    echo "   • Aguardar instalação completa (2-3 min)"
    echo "   • Reiniciar n8n: ${YELLOW}sudo systemctl restart n8n${NC}"
    echo ""
    echo "   ${GREEN}OPÇÃO B - Via SSH:${NC}"
    echo "   ${YELLOW}npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0${NC}"
    echo "   ${YELLOW}sudo systemctl restart n8n${NC}"
    echo ""
    
    read -p "Deseja reiniciar o servidor AGORA? (s/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo -e "${YELLOW}🔄 Reiniciando servidor em 5 segundos...${NC}"
        sleep 5
        sudo reboot
    else
        echo -e "${BLUE}👍 OK! Não esqueça de reiniciar depois!${NC}"
    fi
else
    echo -e "${RED}❌ LIMPEZA INCOMPLETA - alguns arquivos ainda existem${NC}"
    echo -e "${YELLOW}⚠️  Tente executar novamente ou remova manualmente${NC}"
fi

