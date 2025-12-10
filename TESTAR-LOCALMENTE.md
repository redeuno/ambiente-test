# 🧪 COMO TESTAR O NODE LOCALMENTE

## ⚠️ IMPORTANTE
Se você NÃO tem acesso ao servidor, você PRECISA testar localmente primeiro!

---

## 📋 PRÉ-REQUISITOS

1. **Node.js 20+**
```bash
node --version  # Deve ser >= 20.0.0
```

2. **n8n instalado localmente**
```bash
npm install -g n8n
```

---

## 🚀 MÉTODO 1: NPM LINK (Recomendado para desenvolvimento)

### **Passo 1: Build do projeto**
```bash
cd c:\Users\Bruno Mantovani\n8n-nodes-starter-master
npm run build
```

### **Passo 2: Link global**
```bash
npm link
```

### **Passo 3: Link no n8n**
```bash
# Criar pasta de nodes custom do n8n
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes

# Criar package.json se não existir
npm init -y

# Linkar o node
npm link @mantovani.bruno/n8n-nodes-imobzi-new
```

### **Passo 4: Iniciar n8n**
```bash
n8n start
```

### **Passo 5: Acessar**
Abra: http://localhost:5678

---

## 🚀 MÉTODO 2: Instalar o arquivo .tgz

### **Passo 1: Criar o pacote**
```bash
cd c:\Users\Bruno Mantovani\n8n-nodes-starter-master
npm pack
```

Isso cria: `mantovani.bruno-n8n-nodes-imobzi-new-1.2.3.tgz`

### **Passo 2: Instalar localmente**
```bash
# Criar pasta de nodes custom
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes

# Criar package.json se não existir
npm init -y

# Instalar o pacote
npm install /caminho/completo/mantovani.bruno-n8n-nodes-imobzi-new-1.2.3.tgz
```

### **Passo 3: Iniciar n8n**
```bash
n8n start
```

---

## 🚀 MÉTODO 3: Variável de ambiente (Alternativo)

### **Passo 1: Build**
```bash
cd c:\Users\Bruno Mantovani\n8n-nodes-starter-master
npm run build
```

### **Passo 2: Definir variável**
```bash
# Linux/Mac
export N8N_CUSTOM_EXTENSIONS="c:\Users\Bruno Mantovani\n8n-nodes-starter-master"

# Windows PowerShell
$env:N8N_CUSTOM_EXTENSIONS="c:\Users\Bruno Mantovani\n8n-nodes-starter-master"
```

### **Passo 3: Iniciar n8n**
```bash
n8n start
```

---

## ✅ VERIFICAR SE FUNCIONOU

Após iniciar o n8n:

1. Abra http://localhost:5678
2. Crie novo workflow
3. Procure por "Imobzi" na busca de nodes
4. Deve aparecer:
   - ✅ Imobzi
   - ✅ Imobzi Simples
   - ✅ Imobzi Webhook

---

## ❌ SE NÃO APARECER

### **Ver logs do n8n:**
```bash
# O n8n mostra logs no console onde foi iniciado
# Procure por linhas como:
# "Loaded node: imobzi"
# "Loaded node: imobziSimples"
# "Loaded node: imobziWebhook"
```

### **Verificar instalação:**
```bash
# Se usou npm link
ls -la ~/.n8n/nodes/node_modules/@mantovani.bruno/

# Se usou npm install
ls -la ~/.n8n/nodes/node_modules/@mantovani.bruno/
```

### **Limpar cache:**
```bash
rm -rf ~/.n8n/cache/*
rm -rf ~/.n8n/.cache/*
```

---

## 🐛 PROBLEMAS COMUNS

### **1. "Community packages are disabled"**

**Problema:** n8n não permite community nodes por padrão em alguns ambientes.

**Solução:**
```bash
export N8N_COMMUNITY_PACKAGES_ENABLED=true
n8n start
```

### **2. "Cannot find module"**

**Problema:** npm link não funcionou corretamente.

**Solução:** Use o Método 2 (instalar .tgz diretamente)

### **3. Node aparece mas dá erro ao executar**

**Problema:** Pode ser problema de credenciais ou API.

**Solução:**
1. Configure as credenciais corretamente
2. Teste com dados mock primeiro
3. Verifique se a API da Imobzi está acessível

---

## 📝 WINDOWS (PowerShell)

Se estiver no Windows, os caminhos são diferentes:

```powershell
# Criar pasta nodes
mkdir $env:USERPROFILE\.n8n\nodes -Force
cd $env:USERPROFILE\.n8n\nodes

# Inicializar
npm init -y

# Instalar (método 2)
npm install C:\Users\Bruno` Mantovani\n8n-nodes-starter-master\mantovani.bruno-n8n-nodes-imobzi-new-1.2.3.tgz

# Limpar cache
Remove-Item -Path "$env:USERPROFILE\.n8n\cache" -Recurse -Force -ErrorAction SilentlyContinue

# Iniciar
n8n start
```

---

## 🎯 TESTE RÁPIDO

Depois que o node aparecer no n8n:

1. Criar novo workflow
2. Adicionar node "Imobzi Simples"
3. Configurar credenciais (API Key da Imobzi)
4. Escolher operação "Listar Imóveis"
5. Executar
6. Deve retornar lista de imóveis

---

## 📞 AINDA NÃO FUNCIONOU?

Se após todos esses métodos ainda não funcionar:

1. **Copie e cole TODA a saída do terminal** quando rodar `n8n start`
2. **Tire screenshot** da tela do n8n
3. **Me envie** para eu analisar

---

**Tente o Método 1 primeiro e me diga o resultado!** 🚀

