# 📦 Guia de Publicação no npm

## 📋 Pré-requisitos

1. **Conta npm**: Tenha uma conta no npm (https://www.npmjs.com/)
2. **Login npm**: Faça login no terminal
3. **Build**: Certifique-se de que o projeto compila sem erros

## 🔧 Passos para Publicar

### 1. Verificar Informações do Pacote

Edite o `package.json` e atualize:
- **name**: Nome do pacote (se quiser mudar)
- **version**: Versão atual (já atualizado para 1.0.0)
- **author**: Seus dados (nome e email)
- **repository**: URL do seu repositório Git

### 2. Fazer Login no npm

```bash
npm login
```

Você será solicitado a inserir:
- Username
- Password
- Email
- OTP (se tiver 2FA habilitado)

### 3. Verificar se Está Logado

```bash
npm whoami
```

Deve mostrar seu username do npm.

### 4. Verificar Build

```bash
npm run build
```

Certifique-se de que compila sem erros.

### 5. Verificar Lint

```bash
npm run lint
```

Corrija qualquer erro de linting.

### 6. Testar Localmente (Opcional)

```bash
npm pack
```

Isso cria um arquivo `.tgz` que você pode testar localmente antes de publicar.

### 7. Publicar no npm

#### Primeira Publicação (Scoped Package)

Se quiser publicar como pacote scoped (recomendado):

```bash
# Atualizar package.json com nome scoped
# "name": "@seu-usuario/n8n-nodes-imobzi"

npm publish --access public
```

#### Publicação Normal

```bash
npm publish
```

### 8. Verificar Publicação

Após publicar, verifique em:
https://www.npmjs.com/package/seu-pacote

## 🔄 Atualizações Futuras

Para atualizar o pacote:

1. **Atualize a versão** no `package.json`:
   ```bash
   npm version patch   # 1.0.0 → 1.0.1
   npm version minor   # 1.0.0 → 1.1.0
   npm version major   # 1.0.0 → 2.0.0
   ```

2. **Faça o build**:
   ```bash
   npm run build
   ```

3. **Publique**:
   ```bash
   npm publish
   ```

## ⚠️ Importante

### Antes de Publicar

- ✅ Certifique-se de que o build funciona
- ✅ Teste localmente se possível
- ✅ Verifique se não há informações sensíveis no código
- ✅ Atualize o CHANGELOG.md
- ✅ Atualize o README.md se necessário

### Após Publicar

- ✅ Teste a instalação: `npm install -g seu-pacote`
- ✅ Verifique se aparece no npm
- ✅ Atualize documentação se necessário

## 🐛 Troubleshooting

### Erro: "You do not have permission to publish"

- Verifique se está logado: `npm whoami`
- Verifique se o nome do pacote não está em uso
- Se usar scoped package, adicione `--access public`

### Erro: "Package name already exists"

- Escolha outro nome no `package.json`
- Ou use scoped package: `@seu-usuario/nome-do-pacote`

### Erro de Build

- Execute `npm run build` e corrija erros
- Verifique `tsconfig.json`
- Verifique se todas as dependências estão instaladas

## 📝 Checklist Final

Antes de publicar, verifique:

- [ ] Versão atualizada no `package.json`
- [ ] Build funciona sem erros
- [ ] Lint passa sem erros
- [ ] README.md atualizado
- [ ] CHANGELOG.md atualizado
- [ ] Autor e repositório corretos no `package.json`
- [ ] Login no npm feito (`npm whoami` funciona)
- [ ] Nome do pacote disponível

## 🎯 Comandos Rápidos

```bash
# Login
npm login

# Verificar login
npm whoami

# Build
npm run build

# Lint
npm run lint

# Publicar
npm publish

# Publicar scoped (público)
npm publish --access public

# Atualizar versão e publicar
npm version patch && npm publish
```

---

**Boa sorte com a publicação! 🚀**


