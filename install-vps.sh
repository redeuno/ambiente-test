#!/bin/bash

# Script de instalação do n8n-nodes-imobzi para VPS
# Criado por: Minutare

echo "🚀 Instalando n8n-nodes-imobzi na VPS..."

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar se o n8n está instalado
if ! command -v n8n &> /dev/null; then
    echo "❌ n8n não está instalado. Instalando..."
    npm install -g n8n
fi

# Instalar o pacote n8n-nodes-imobzi
echo "📦 Instalando n8n-nodes-imobzi..."
npm install -g n8n-nodes-imobzi

# Verificar se a instalação foi bem-sucedida
if npm list -g n8n-nodes-imobzi &> /dev/null; then
    echo "✅ n8n-nodes-imobzi instalado com sucesso!"
else
    echo "❌ Erro na instalação do n8n-nodes-imobzi"
    exit 1
fi

# Detectar como o n8n está rodando
echo "🔍 Detectando como o n8n está rodando..."

# Verificar se está usando PM2
if command -v pm2 &> /dev/null && pm2 list | grep -q n8n; then
    echo "🔄 Reiniciando n8n via PM2..."
    pm2 restart n8n
    echo "✅ n8n reiniciado via PM2"
elif systemctl is-active --quiet n8n; then
    echo "🔄 Reiniciando n8n via systemd..."
    sudo systemctl restart n8n
    echo "✅ n8n reiniciado via systemd"
else
    echo "⚠️  n8n não foi detectado rodando via PM2 ou systemd"
    echo "💡 Reinicie manualmente o n8n para carregar os novos nodes"
fi

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse o n8n no seu navegador"
echo "2. Vá para Settings > Credentials"
echo "3. Adicione as credenciais da Imobzi API"
echo "4. Procure pelos nodes 'Imobzi' e 'Imobzi Webhook'"
echo ""
echo "🔗 Links úteis:"
echo "- Pacote no npm: https://www.npmjs.com/package/n8n-nodes-imobzi"
echo "- Documentação: https://developer.imobzi.com/"
echo ""
echo "📞 Suporte: contato@minutare.com" 