# Imobzi Node para n8n

Este node permite integrar o n8n com a API da Imobzi, uma plataforma de gestão imobiliária.

## Funcionalidades

### Recursos Disponíveis

- **Leads**: Criar, obter, listar e atualizar leads
- **Imóveis**: Criar, obter, listar e atualizar imóveis
- **Contatos**: Criar, obter, listar e atualizar contatos
- **Conta**: Obter informações da conta

### Operações

Para cada recurso, as seguintes operações estão disponíveis:

- **Criar**: Criar um novo registro
- **Obter**: Buscar um registro específico por ID
- **Listar**: Buscar todos os registros
- **Atualizar**: Atualizar um registro existente

## Configuração

### Credenciais

1. **API Key**: Sua chave de API da Imobzi
2. **Environment**: Escolha entre Production ou Sandbox

### Como obter sua API Key

1. Acesse o painel da Imobzi
2. Vá para Configurações > API
3. Gere uma nova chave de API
4. Copie a chave e configure no n8n

## Exemplos de Uso

### Criar um Lead

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+5511999999999"
}
```

### Criar um Imóvel

```json
{
  "title": "Casa em São Paulo",
  "type": "house",
  "price": 500000
}
```

### Criar um Contato

```json
{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "+5511888888888"
}
```

## Endpoints da API

- **Production**: https://api.imobzi.com
- **Sandbox**: https://sandbox-api.imobzi.com

## Documentação da API

Para mais informações sobre a API da Imobzi, consulte:
https://developer.imobzi.com/

## Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório do projeto. 

## Recursos Planejados

Os seguintes recursos da API Imobzi serão implementados como nodes dedicados, com suporte completo em português e exemplos práticos:

- Contratos
- Financeiro
- Locações
- Documentos
- Tarefas
- Agenda
- Integrações
- Webhooks (avançado)
- Usuários/Corretores
- Campos Personalizados

Cada recurso terá operações de criar, obter, listar, atualizar e outras específicas, conforme a documentação oficial da Imobzi. 

## Progresso dos Recursos

| Recurso              | Status      |
|----------------------|-------------|
| Leads                | ✅ Pronto   |
| Imóveis              | ✅ Pronto   |
| Contatos             | ✅ Pronto   |
| Conta                | ✅ Pronto   |
| Contratos            | 🚧 Em breve |
| Financeiro           | 🚧 Em breve |
| Locações             | 🚧 Em breve |
| Documentos           | 🚧 Em breve |
| Tarefas              | 🚧 Em breve |
| Agenda               | 🚧 Em breve |
| Integrações          | 🚧 Em breve |
| Webhooks (avançado)  | 🚧 Em breve |
| Usuários/Corretores  | 🚧 Em breve |
| Campos Personalizados| 🚧 Em breve | 

## Exemplos Práticos (Planejados)

### Contratos
```json
// Exemplo de criação de contrato (em breve)
```

### Financeiro
```json
// Exemplo de lançamento financeiro (em breve)
```

### Locações
```json
// Exemplo de cadastro de locação (em breve)
```

### Documentos
```json
// Exemplo de upload de documento (em breve)
```

### Tarefas
```json
// Exemplo de criação de tarefa (em breve)
```

### Agenda
```json
// Exemplo de evento na agenda (em breve)
```

### Integrações
```json
// Exemplo de integração externa (em breve)
```

### Webhooks (avançado)
```json
// Exemplo de payload recebido (em breve)
```

### Usuários/Corretores
```json
// Exemplo de cadastro de corretor (em breve)
```

### Campos Personalizados
```json
// Exemplo de uso de campo personalizado (em breve)
``` 

## Como Contribuir

Se você deseja colaborar com a expansão deste pacote, envie um pull request com melhorias, novos nodes ou exemplos práticos. Sugestões e correções são bem-vindas!

1. Fork este repositório
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Faça suas alterações
4. Envie um pull request

Vamos juntos tornar a integração com a Imobzi cada vez mais completa no n8n! 