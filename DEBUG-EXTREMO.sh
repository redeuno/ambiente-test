#!/bin/bash

echo "=========================================="
echo "DEBUG EXTREMO - N8N NODE IMOBZI"
echo "=========================================="
echo ""

# 1. Verificar versão instalada
echo "1. VERSÃO INSTALADA:"
npm list -g @mantovani.bruno/n8n-nodes-imobzi-new

# 2. Ver localização
echo ""
echo "2. LOCALIZAÇÃO:"
npm root -g

# 3. Ver TODOS os arquivos instalados
echo ""
echo "3. ARQUIVOS INSTALADOS:"
ls -laR $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/

# 4. Ver package.json instalado
echo ""
echo "4. PACKAGE.JSON INSTALADO:"
cat $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/package.json

# 5. CRÍTICO: Verificar se há package.json no dist/
echo ""
echo "5. VERIFICAR DIST/PACKAGE.JSON (DEVE DAR ERRO):"
cat $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/dist/package.json 2>&1

# 6. CRÍTICO: Verificar se há .node.json
echo ""
echo "6. VERIFICAR .NODE.JSON (NÃO DEVE TER NENHUM):"
find $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/ -name "*.node.json" 2>/dev/null

# 7. Ver o código JavaScript compilado
echo ""
echo "7. VER CÓDIGO DO IMOBZISIMPLES:"
head -20 $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/ImobziSimples/ImobziSimples.node.js

# 8. Verificar versão do n8n
echo ""
echo "8. VERSÃO DO N8N:"
npm list -g n8n

# 9. Ver logs do n8n
echo ""
echo "9. LOGS DO N8N (últimas 50 linhas):"
pm2 logs n8n --lines 50 --nostream 2>/dev/null || docker logs n8n --tail 50 2>/dev/null || journalctl -u n8n -n 50 --no-pager 2>/dev/null

echo ""
echo "=========================================="
echo "FIM DO DIAGNÓSTICO"
echo "=========================================="

