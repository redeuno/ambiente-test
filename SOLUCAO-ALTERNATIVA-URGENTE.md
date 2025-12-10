# 🚨 SOLUÇÃO ALTERNATIVA URGENTE

Se o node **AINDA NÃO FUNCIONA** após tudo, temos 3 opções:

---

## 🎯 OPÇÃO 1: Instalação Manual Forçada

Execute isto **NO SERVIDOR**:

```bash
#!/bin/bash
# Instalação manual forçada

echo "=== LIMPEZA TOTAL ==="

# 1. Parar TUDO
sudo systemctl stop n8n
pkill -9 n8n
sleep 5

# 2. Remover TUDO relacionado ao node
rm -rf ~/.n8n/nodes/node_modules/@mantovani.bruno
rm -rf ~/.n8n/.cache/nodes/@mantovani.bruno
rm -rf ~/.n8n/.cache/nodes
rm -rf /usr/local/lib/node_modules/@mantovani.bruno

# 3. Limpar cache npm AGRESSIVAMENTE
npm cache clean --force
npm cache verify

# 4. Criar estrutura do zero
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes

# 5. Instalar o node DIRETAMENTE
if [ ! -f package.json ]; then
    echo '{"name":"n8n-custom-nodes","version":"1.0.0","dependencies":{}}' > package.json
fi

# 6. Instalar com flag de força
npm install --force @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0

# 7. Verificar instalação
if [ -d node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist ]; then
    echo "✅ Node instalado!"
    ls -la node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/
else
    echo "❌ Falhou!"
    exit 1
fi

# 8. Reiniciar servidor (OBRIGATÓRIO!)
echo "REINICIANDO SERVIDOR EM 10 SEGUNDOS..."
sleep 10
sudo reboot
```

---

## 🎯 OPÇÃO 2: Downgrade para Versão Estável Anterior

Se v1.1.0 tem problema, instale v1.0.3:

```bash
# Parar n8n
sudo systemctl stop n8n

# Desinstalar versão problemática
npm uninstall -g @mantovani.bruno/n8n-nodes-imobzi-new

# Instalar versão antiga estável
npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.0.3

# Reiniciar
sudo systemctl start n8n
```

**Verificar versões disponíveis:**
```bash
npm view @mantovani.bruno/n8n-nodes-imobzi-new versions --json
```

---

## 🎯 OPÇÃO 3: Instalar de Forma DIFERENTE

### **A) Via tarball direto do npm:**

```bash
# Baixar tarball
cd /tmp
npm pack @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0

# Instalar do tarball
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm install /tmp/mantovani.bruno-n8n-nodes-imobzi-new-1.1.0.tgz

# Reiniciar
sudo systemctl restart n8n
```

### **B) Via GitHub direto:**

```bash
# Clonar repositório
cd /tmp
git clone https://github.com/redeuno/imobzi-new.git
cd imobzi-new

# Build local
npm install
npm run build

# Instalar localmente
cd ~/.n8n/nodes
npm install /tmp/imobzi-new

# Reiniciar
sudo systemctl restart n8n
```

---

## 🔍 DIAGNÓSTICO: POR QUE NÃO ESTÁ FUNCIONANDO?

### **Possíveis causas além de cache:**

#### **1. Versão do n8n incompatível**

Verificar:
```bash
n8n --version
```

Se for **< 0.200.0**, o node NÃO VAI FUNCIONAR!

**Solução:**
```bash
npm update -g n8n
```

---

#### **2. Node.js muito antigo**

Verificar:
```bash
node --version
```

Se for **< 18.0.0**, pode ter problemas!

**Solução:**
```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

#### **3. Permissões erradas**

Os arquivos podem ter permissões incorretas.

**Solução:**
```bash
# Corrigir permissões
chown -R $(whoami):$(whoami) ~/.n8n
chmod -R 755 ~/.n8n
```

---

#### **4. n8n não está carregando Community Nodes**

Verificar configuração:

```bash
# Ver configuração do n8n
cat ~/.n8n/config

# Verificar variáveis de ambiente
systemctl show n8n -p Environment
```

**Verificar se Community Nodes está habilitado:**

O n8n pode estar com Community Nodes **DESABILITADO** por segurança!

**Solução:**

Editar configuração do n8n:

```bash
nano ~/.n8n/config
```

Adicionar/verificar:
```json
{
  "nodes": {
    "communityPackages": {
      "enabled": true
    }
  }
}
```

Ou via variável de ambiente:
```bash
export N8N_COMMUNITY_PACKAGES_ENABLED=true
```

---

#### **5. Firewall ou Proxy bloqueando npm**

Se a instalação falha ao baixar:

```bash
# Testar conexão com npm
curl -I https://registry.npmjs.org/@mantovani.bruno/n8n-nodes-imobzi-new

# Se falhar, configurar proxy
npm config set proxy http://seu-proxy:porta
npm config set https-proxy http://seu-proxy:porta
```

---

#### **6. Problema com TypeScript no servidor**

Alguns servidores têm TypeScript global que conflita:

```bash
# Verificar
tsc --version

# Se existir, pode estar causando conflito
# Desinstalar temporariamente
npm uninstall -g typescript
```

---

## 🚨 TESTE DEFINITIVO: O CÓDIGO ESTÁ CORRETO?

Para ter **100% de certeza**, teste localmente:

### **No seu PC/Mac (não no servidor):**

```bash
# 1. Criar pasta de teste
mkdir ~/test-n8n
cd ~/test-n8n

# 2. Instalar n8n
npm install n8n

# 3. Instalar o node
npm install @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0

# 4. Iniciar n8n
npx n8n start

# 5. Abrir http://localhost:5678
# 6. Procurar "Imobzi" nos nodes
```

**Se funcionar localmente mas não no servidor:**
→ Problema é **DEFINITIVAMENTE** no servidor!

**Se NÃO funcionar nem localmente:**
→ Problema é **NO CÓDIGO** (mas isso é improvável)!

---

## 🎯 ÚLTIMO RECURSO: Reinstalar n8n

Se NADA funcionar:

```bash
#!/bin/bash
# Reinstalação completa do n8n

# 1. Backup workflows
n8n export:workflow --all --output=~/backup-workflows-$(date +%Y%m%d).json

# 2. Backup credentials
cp -r ~/.n8n/credentials ~/backup-credentials-$(date +%Y%m%d)

# 3. Parar n8n
sudo systemctl stop n8n

# 4. Desinstalar tudo
npm uninstall -g n8n
rm -rf ~/.n8n

# 5. Limpar npm
npm cache clean --force

# 6. Reinstalar n8n
npm install -g n8n@latest

# 7. Iniciar n8n
n8n start &

# 8. Aguardar inicialização
sleep 10

# 9. Restaurar workflows
n8n import:workflow --input=~/backup-workflows-*.json

# 10. Instalar node Imobzi
npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.1.0

# 11. Configurar systemd novamente
sudo systemctl start n8n
```

---

## 📞 INFORMAÇÕES QUE PRECISO

Para eu te ajudar de verdade, preciso saber:

### **1. Erro EXATO:**
```
Cole aqui a mensagem de erro completa que você está vendo
```

### **2. Resultado deste comando:**
```bash
cd ~/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new
ls -la
cat package.json | grep version
ls -la dist/
```

### **3. Logs do n8n:**
```bash
sudo journalctl -u n8n -n 100 --no-pager
```

### **4. Teste de carregamento:**
```bash
node -e "
try {
  const n = require('/home/SEU_USUARIO/.n8n/nodes/node_modules/@mantovani.bruno/n8n-nodes-imobzi-new/dist/nodes/Imobzi/Imobzi.node.js');
  console.log('OK:', Object.keys(n));
  const i = new n.Imobzi();
  console.log('Instance:', i.description.name);
} catch(e) {
  console.error('ERRO:', e.message);
  console.error('Stack:', e.stack);
}
"
```

### **5. Versões:**
```bash
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "n8n: $(n8n --version)"
```

---

## 🎯 AÇÃO IMEDIATA

**POR FAVOR, EXECUTE ESTE SCRIPT E ME ENVIE O RESULTADO:**

```bash
wget https://raw.githubusercontent.com/redeuno/imobzi-new/main/coletar-info-servidor.sh
chmod +x coletar-info-servidor.sh
./coletar-info-servidor.sh
cat debug-n8n-*.txt
```

**ME ENVIE TODO O RESULTADO!** Só assim consigo ver exatamente o que está acontecendo.

---

## 💡 PRÓXIMOS PASSOS

1. ✅ Execute o script de coleta de informações
2. ✅ Me envie o resultado completo
3. ✅ Responda as perguntas acima
4. ✅ Vou analisar e criar solução específica para seu caso

**Estou aqui para te ajudar, mas preciso das informações do servidor!** 🙏

