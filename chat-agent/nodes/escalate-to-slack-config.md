# Tool: Escalate to Support (Slack Notification)

## Descrição

Tool que o AI Agent usa quando não consegue ajudar adequadamente o usuário. Envia notificação para o canal de suporte no Slack.

---

## Configuração no n8n

### Passo 1: Criar a Tool no AI Agent

No **AI Agent** node, adicione uma nova tool:

**Name:** `escalate_to_support`

**Description:**
```
Use this tool when you cannot adequately help the user. This will notify the human support team via Slack. Include: summary of the issue, context collected, what's missing, and why you need human assistance.
```

**Tool Type:** `Custom Tool` ou `Workflow Tool`

---

### Passo 2: Criar Sub-Workflow para Slack

Crie um novo workflow chamado "Slack Support Notification":

```
[Execute Workflow Trigger] → [Slack Node] → [Return Data]
```

#### Slack Node Configuration

**Credential:** Sua credencial Slack OAuth2

**Resource:** Message

**Operation:** Send

**Channel:** `#suporte-finn-ai` (ou seu canal)

**Message (Block Kit):**
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🚨 Finn AI - Escalation Request",
        "emoji": true
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Session ID:*\n{{ $json.sessionId }}"
        },
        {
          "type": "mrkdwn",
          "text": "*Category:*\n{{ $json.category }}"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*📋 Summary:*\n{{ $json.summary }}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*✅ Context Collected:*\n{{ $json.contextCollected }}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*❓ Missing/Unclear:*\n{{ $json.missingInfo }}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*💡 Reason for Escalation:*\n{{ $json.reason }}"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "🤖 Escalated by Finn AI | <{{ $json.chatUrl }}|Open Chat>"
        }
      ]
    }
  ]
}
```

---

### Passo 3: Input Schema da Tool

No AI Agent, defina o schema de input da tool:

```json
{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string",
      "description": "Brief summary of the user's issue"
    },
    "contextCollected": {
      "type": "string",
      "description": "What information was collected from the user"
    },
    "missingInfo": {
      "type": "string",
      "description": "What information is missing or unclear"
    },
    "reason": {
      "type": "string",
      "description": "Why AI assistance is insufficient for this case"
    }
  },
  "required": ["summary", "reason"]
}
```

---

### Passo 4: Conectar Tool ao Sub-Workflow

No AI Agent node:
1. Vá em **Tools**
2. Adicione **Call n8n Workflow Tool**
3. Selecione o workflow "Slack Support Notification"
4. Configure os parâmetros de entrada

---

## Alternativa: Slack Node Direto (sem sub-workflow)

Se preferir não usar sub-workflow, pode usar **HTTP Request** como tool:

**Tool Type:** HTTP Request

**URL:** `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

**Method:** POST

**Body:**
```json
{
  "text": "🚨 *Finn AI Escalation*\n\n*Summary:* {{ $json.summary }}\n*Reason:* {{ $json.reason }}"
}
```

---

## Mensagem que o AI deve enviar ao usuário após escalonar

Após usar a tool, o AI deve responder ao usuário:

```
Entendi sua situação! 🙏

Vou acionar nosso time de suporte para te ajudar com esse caso específico.
Um dos nossos especialistas vai entrar em contato em breve.

Enquanto isso, se tiver mais detalhes para compartilhar, fique à vontade!
```

---

## Exemplo de Uso pelo AI

Quando o AI Agent determina que precisa escalar:

```
AI Internal Decision:
- User has complex multi-reference filtering issue
- Documentation doesn't cover this specific case
- Need human expertise
→ Call escalate_to_support tool

Tool Input:
{
  "summary": "User trying to filter CMS items using multi-reference field with dynamic values",
  "contextCollected": "Product: Attributes v2, Has staging URL, Provided HTML",
  "missingInfo": "Specific expected behavior vs actual behavior",
  "reason": "Complex use case not covered in documentation, requires human debugging"
}
```

---

## Configuração do Canal Slack

Recomendações:
1. Crie canal dedicado: `#suporte-finn-ai`
2. Adicione os membros do suporte: @Support-Luis @Support-Pedro
3. Configure notificações para menções
4. Opcional: Integre com sistema de tickets (Zendesk, Linear, etc.)
