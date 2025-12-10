# 🚀 GUIA SUPER FÁCIL DE INSTALAÇÃO

## ⚠️ IMPORTANTE: Leia TUDO antes de começar!

---

## 📋 PASSO 1: PREPARAR

1. **Feche TODOS os programas** que estejam usando o n8n
2. **Feche o navegador** se tiver o n8n aberto
3. **Salve qualquer trabalho** que esteja fazendo

---

## 🧹 PASSO 2: LIMPAR TUDO (IMPORTANTE!)

### Opção A: Usar o Script Automático (RECOMENDADO)

1. Clique com o **botão direito** no arquivo `limpar-cache-n8n.ps1`
2. Escolha **"Executar com PowerShell"**
3. Se pedir permissão, clique em **"Sim"**
4. Aguarde até aparecer "LIMPEZA CONCLUÍDA!"

### Opção B: Fazer Manualmente

Abra o **PowerShell como Administrador** e cole estes comandos (um de cada vez):

```powershell
# Parar n8n
Get-Process -Name "*n8n*" -ErrorAction SilentlyContinue | Stop-Process -Force

# Limpar cache do NPM
npm cache clean --force

# Limpar cache do n8n
Remove-Item -Path "$env:USERPROFILE\.n8n\cache\*" -Recurse -Force -ErrorAction SilentlyContinue

# Desinstalar versão antiga
npm uninstall -g @mantovani.bruno/n8n-nodes-imobzi-new

# Instalar versão nova
npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.0.5
```

---

## 🔄 PASSO 3: REINICIAR

**ESCOLHA UMA DAS OPÇÕES:**

### Opção 1: Reiniciar o Computador (MAIS GARANTIDO)
- Simplesmente reinicie o computador
- É a forma mais garantida de limpar tudo

### Opção 2: Só Reiniciar o n8n (MAIS RÁPIDO)
- Abra um **novo terminal**
- Execute: `n8n start`

---

## ✅ PASSO 4: VERIFICAR SE FUNCIONOU

1. Abra o n8n no navegador
2. Clique em **"+"** para adicionar um node
3. Digite **"imobzi"** na busca
4. Você deve ver:
   - 🏠 **Imobzi** (com logo)
   - 🔔 **Imobzi Webhook** (com logo)

---

## ❌ SE AINDA NÃO FUNCIONAR

Execute este comando e me envie o resultado:

```powershell
npm list -g @mantovani.bruno/n8n-nodes-imobzi-new
```

Também me envie uma captura de tela do erro que aparece no n8n.

---

## 🆘 PRECISA DE AJUDA?

Me envie:
1. ✅ Uma captura de tela do erro
2. ✅ O resultado do comando acima
3. ✅ Me diga qual versão do Windows você usa

---

## 🎯 CREDENCIAIS - CONFIGURAÇÃO CORRETA

Quando for configurar a credencial do Imobzi:

1. Clique em **"Create New Credential"**
2. Escolha **"Imobzi API"**
3. Cole sua **API Key** da Imobzi
4. Clique em **"Save"**

**⚠️ IMPORTANTE:** A API Key da Imobzi é aquela que você pega no painel da Imobzi em:
- **Configurações** → **Integrações** → **API**

---

## 📞 TESTANDO A CONEXÃO

Depois de configurar a credencial:

1. Adicione um node **"Imobzi"**
2. Escolha a credencial que criou
3. Em **Resource**, escolha **"Contact"**
4. Em **Operation**, escolha **"Get Many"**
5. Clique em **"Execute Node"**

Se funcionar, vai trazer uma lista de contatos! 🎉

