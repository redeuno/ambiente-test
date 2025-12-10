# Guia de Instalação e Uso - n8n-nodes-imobzi

## 📦 Pacote Publicado

Seu pacote foi publicado com sucesso no npm:
**https://www.npmjs.com/package/n8n-nodes-imobzi**

## 🚀 Como Instalar

### Opção 1: Instalação Global (Recomendado)

```bash
npm install -g n8n-nodes-imobzi
```

### Opção 2: Instalação Local

```bash
npm install n8n-nodes-imobzi
```

## 🔧 Configuração no n8n

### 1. Reinicie o n8n
Após instalar o pacote, reinicie o n8n para que os novos nodes sejam carregados.

### 2. Configure as Credenciais
1. No n8n, vá para **Settings** > **Credentials**
2. Clique em **Add Credential**
3. Procure por **"Imobzi API"**
4. Configure:
   - **API Key**: Sua chave da API da Imobzi
   - **Environment**: Production ou Sandbox

### 3. Como Obter a API Key da Imobzi
1. Acesse o painel da Imobzi
2. Vá para **Configurações** > **API**
3. Clique em **Gerar Nova Chave**
4. Copie a chave e configure no n8n

## 📋 Nodes Disponíveis

### 1. Imobzi Node
**Localização**: Transform > Imobzi

**Recursos**:
- **Leads**: Create, Get, Get Many, Update
- **Imóveis**: Create, Get, Get Many, Update  
- **Contatos**: Create, Get, Get Many, Update
- **Conta**: Get

### 2. Imobzi Webhook Node
**Localização**: Trigger > Imobzi Webhook

**Eventos Suportados**:
- Lead Criado/Atualizado
- Imóvel Criado/Atualizado
- Contato Criado/Atualizado
- Visita Agendada/Cancelada

## 🔄 Exemplos de Workflows

### Exemplo 1: Criar Lead Automaticamente
1. Adicione o **Imobzi Webhook** como trigger
2. Configure para eventos de "Lead Criado"
3. Conecte com o **Imobzi Node**
4. Configure para criar um contato baseado no lead

### Exemplo 2: Sincronizar Imóveis
1. Use um **Cron** ou **Schedule** trigger
2. Conecte com **Imobzi Node** (Get Many Properties)
3. Processe os dados conforme necessário

## 🌐 Instalação em VPS

### Para sua VPS:

```bash
# 1. Acesse sua VPS via SSH
ssh usuario@seu-servidor.com

# 2. Navegue até o diretório do n8n
cd /caminho/para/seu/n8n

# 3. Instale o pacote
npm install -g n8n-nodes-imobzi

# 4. Reinicie o n8n
# Se usar PM2:
pm2 restart n8n

# Se usar systemd:
sudo systemctl restart n8n

# Se usar Docker:
docker restart seu-container-n8n
```

### Para outros usuários:

```bash
# Qualquer pessoa pode instalar usando:
npm install -g n8n-nodes-imobzi
```

## 🔗 Links Úteis

- **Pacote no npm**: https://www.npmjs.com/package/n8n-nodes-imobzi
- **Documentação da API Imobzi**: https://developer.imobzi.com/
- **Repositório GitHub**: https://github.com/minutare/n8n-nodes-imobzi

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique a instalação**:
   ```bash
   npm list -g n8n-nodes-imobzi
   ```

2. **Verifique os logs do n8n**:
   ```bash
   # Se usar PM2
   pm2 logs n8n
   
   # Se usar systemd
   sudo journalctl -u n8n -f
   ```

3. **Reinstale se necessário**:
   ```bash
   npm uninstall -g n8n-nodes-imobzi
   npm install -g n8n-nodes-imobzi
   ```

## 📝 Próximos Passos

1. **Teste os nodes** no seu n8n local
2. **Crie workflows de exemplo** para demonstrar o uso
3. **Atualize a documentação** conforme necessário
4. **Publique atualizações** quando fizer melhorias

## 🎯 Para Desenvolvedores

Se quiser contribuir ou modificar:

```bash
# Clone o repositório
git clone https://github.com/minutare/n8n-nodes-imobzi.git

# Instale dependências
npm install

# Desenvolva
npm run dev

# Teste
npm run lint
npm run build

# Publique atualizações
npm version patch  # ou minor/major
npm publish
```

---

**Criado por**: Bruno Mantovani  
**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Repositório**: https://github.com/redeuno/imobzi-new 