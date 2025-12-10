# 🔧 REINSTALAÇÃO COMPLETA NO SERVIDOR

## ⚠️ IMPORTANTE
Você está tendo o erro: **"Unrecognized node type: @mantovani.bruno/n8n-nodes-imobzi-new"**

Isso significa que o n8n no servidor está identificando o node ERRADO (pelo nome do pacote em vez do nome do node).

---

## 🚀 SOLUÇÃO: REINSTALAÇÃO LIMPA

Execute estes comandos **NO SERVIDOR** onde o n8n está rodando:

### **1. PARAR N8N**
```bash
# Se usar pm2:
pm2 stop n8n

# Se usar systemd:
sudo systemctl stop n8n

# Se usar Docker:
docker stop n8n
```

---

### **2. DESINSTALAR COMPLETAMENTE**
```bash
# Desinstalar todas as versões
npm uninstall -g @mantovani.bruno/n8n-nodes-imobzi-new

# Verificar se foi removido
npm list -g @mantovani.bruno/n8n-nodes-imobzi-new
# Deve dar erro ou "empty"
```

---

### **3. LIMPAR TUDO**
```bash
# Limpar cache do npm
npm cache clean --force

# Limpar cache do n8n (TODOS os possíveis locais)
rm -rf ~/.n8n/cache
rm -rf ~/.n8n/.cache
rm -rf /root/.n8n/cache
rm -rf /root/.n8n/.cache
rm -rf /home/node/.n8n/cache
rm -rf /home/node/.n8n/.cache

# Se for Docker, limpar dentro do container:
docker exec n8n rm -rf /home/node/.n8n/cache
docker exec n8n rm -rf /home/node/.n8n/.cache
docker exec n8n rm -rf /root/.n8n/cache

# Limpar possíveis nodes antigos
find $(npm root -g) -name "*imobzi*" -type d -exec rm -rf {} + 2>/dev/null
```

---

### **4. VERIFICAR VERSÃO DO NODE.JS**
```bash
node --version
# Deve ser >= 20.15

# Se for menor, instalar Node.js 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

### **5. INSTALAR VERSÃO 1.2.1 (LIMPA)**
```bash
# Instalar globalmente
npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.2.1 --verbose

# Aguardar completar...
```

---

### **6. VERIFICAR INSTALAÇÃO**
```bash
# Ver versão instalada
npm list -g @mantovani.bruno/n8n-nodes-imobzi-new

# Deve mostrar: @mantovani.bruno/n8n-nodes-imobzi-new@1.2.1

# Ver onde foi instalado
npm root -g

# Listar arquivos
ls -la $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/

# Ver nodes instalados
ls -la $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/

# Deve mostrar:
# Imobzi/
# ImobziSimples/
# ImobziWebhook/
```

---

### **7. REINICIAR N8N**
```bash
# Se usar pm2:
pm2 restart n8n
pm2 logs n8n --lines 100

# Se usar systemd:
sudo systemctl restart n8n
sudo journalctl -u n8n -f

# Se usar Docker:
docker restart n8n
docker logs n8n -f
```

---

### **8. VERIFICAR LOGS**
Procure por linhas como:
```
Loaded node: imobzi
Loaded node: imobziSimples
Loaded node: imobziWebhook
```

**NÃO** deve ter erros de carregamento!

---

### **9. TESTAR NO N8N**

1. Abra o n8n no navegador
2. **DELETAR** qualquer workflow antigo
3. Criar **NOVO** workflow
4. Procurar "Imobzi" na busca
5. Deve aparecer:
   - ✅ Imobzi
   - ✅ Imobzi Simples
   - ✅ Imobzi Webhook
6. Arrastar "Imobzi Simples"
7. Configurar credential
8. Executar

---

## ❌ SE AINDA DER ERRO

Execute e me mande o resultado:

```bash
# 1. Verificar instalação
npm list -g @mantovani.bruno/n8n-nodes-imobzi-new

# 2. Ver conteúdo do package.json instalado
cat $(npm root -g)/@mantovani.bruno/n8n-nodes-imobzi-new/package.json | grep -A 10 '"n8n"'

# 3. Ver logs do n8n
pm2 logs n8n --lines 50
# OU
docker logs n8n --tail 50

# 4. Ver versão do n8n
npm list -g n8n
```

---

## 🆘 ALTERNATIVA: INSTALAÇÃO LOCAL

Se a global não funcionar, tente instalação local:

```bash
# Ir para pasta do n8n
cd ~/.n8n/

# Instalar localmente
npm install @mantovani.bruno/n8n-nodes-imobzi-new@1.2.1

# Reiniciar n8n
pm2 restart n8n
```

---

## 📝 CHECKLIST

- [ ] n8n parado
- [ ] Node desinstalado
- [ ] Cache limpo (npm + n8n)
- [ ] Versão 1.2.1 instalada
- [ ] Instalação verificada
- [ ] n8n reiniciado
- [ ] Logs verificados
- [ ] Workflow novo testado

---

**Me mande prints ou logs se ainda não funcionar!** 🚀

