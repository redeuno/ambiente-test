# Finalize Chat - Configuração do Sub-Fluxo Slack

## Arquitetura do Sub-Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENT PRINCIPAL                           │
│                                                                 │
│  Chama: finalize_chat tool                                      │
│                                                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUB-AGENTE: Finalize Chat                    │
│                                                                 │
│  System Prompt: system prompt tool finalizar chat.md            │
│  Recebe: session data, support data, feedback data              │
│  Gera: JSON estruturado com summary                             │
│                                                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TOOL: Call n8n Workflow                      │
│                                                                 │
│  Workflow: "Finn AI - Chat Summary to Slack"                    │
│                                                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              WORKFLOW: Finn AI - Chat Summary to Slack          │
│                                                                 │
│  [Execute Workflow Trigger]                                     │
│              ↓                                                  │
│  [Code Node: format-chat-summary.js]                           │
│              ↓                                                  │
│  [Slack Node: Send Summary]                                     │
│              ↓                                                  │
│  [Respond to Trigger]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PARTE 1: Tool no Sub-Agente Finalize Chat

### Tool Name
```
send_to_slack
```

### Tool Description
```
Send the finalized chat summary to the Slack support channel. Call this tool with the complete summary data after generating it.

Required fields:
- status: "resolved" or "escalated"
- user: Object with name, email, forum_username, fins_plus
- problem: Description of the issue
- solution: What was done to resolve (or null if escalated)
- nps: Object with score and category (or null if not collected)
- escalation_reason: Why escalated (only if status is "escalated")
- duration_estimate: Approximate chat duration
```

---

## PARTE 2: Workflow "Finn AI - Chat Summary to Slack"

### Workflow Name
```
Finn AI - Chat Summary to Slack
```

### Node 1: Execute Workflow Trigger

**Type:** Execute Workflow Trigger

**Purpose:** Receives data from the Finalize Chat sub-agent

---

### Node 2: Code Node (format-chat-summary.js)

**Name:** `Format Chat Summary`

**Language:** JavaScript

**Code:** Use o arquivo `format-chat-summary.js` já criado

**Input esperado:**
```json
{
  "status": "resolved",
  "user": {
    "name": "John",
    "email": "john@email.com",
    "forum_username": "john_dev",
    "fins_plus": true
  },
  "problem": "Filter not showing results",
  "solution": "Fixed fs-cmsfilter-field attribute",
  "nps": {
    "score": 9,
    "category": "promoter"
  },
  "escalation_reason": null,
  "attempted_solutions": null,
  "duration_estimate": "~15 min"
}
```

**Output:**
```json
{
  "text": "Full formatted Slack message",
  "blocks": [/* Slack Block Kit array */],
  "header": "✅ CHAT SUPPORT COMPLETED",
  "status": "resolved",
  "user_name": "John",
  "nps_display": "9/10 — PROMOTER 💚"
}
```

---

### Node 3: Slack Node

**Name:** `Send Chat Summary`

**Credential:** Sua credencial Slack

**Resource:** Message

**Operation:** Send a Message (Block Kit)

**Channel:** `#suporte-finn-ai` (mesmo canal do escalation)

#### Option A: Using Block Kit (Recomendado)

**Blocks:**
```
{{ $json.blocks }}
```

**Fallback Text:**
```
{{ $json.text }}
```

#### Option B: Using Text Message (Alternativa simples)

**Text:**
```
{{ $json.text }}
```

---

### Node 4: Respond to Trigger

**Name:** `Return Success`

**Response:**
```json
{
  "success": true,
  "message": "Chat summary sent to Slack",
  "status": "{{ $('Format Chat Summary').item.json.status }}",
  "slackMessageId": "{{ $json.ts }}"
}
```

---

## PARTE 3: Slack Block Kit Templates

### Template: Chat Resolved ✅

```json
[
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "✅ CHAT SUPPORT COMPLETED",
      "emoji": true
    }
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*👤 User:*\n{{ $json.user_name }}"
      },
      {
        "type": "mrkdwn",
        "text": "*🏷️ Fins+:*\n{{ $json.fins_plus ? 'Yes' : 'No' }}"
      }
    ]
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*📧 Email:*\n{{ $json.email || 'Not provided' }}"
      },
      {
        "type": "mrkdwn",
        "text": "*👤 Forum:*\n{{ $json.forum_username ? '@' + $json.forum_username : 'N/A' }}"
      }
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*🛠️ Product:*\n{{ $json.product }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*❓ Problem:*\n{{ $json.problem }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*✅ Solution:*\n{{ $json.solution }}"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*⭐ NPS:*\n{{ $json.nps_display }}"
      },
      {
        "type": "mrkdwn",
        "text": "*⏱️ Duration:*\n{{ $json.duration_estimate }}"
      }
    ]
  },
  {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "🤖 Resolved by Finn AI | {{ $now.format('YYYY-MM-DD HH:mm') }}"
      }
    ]
  }
]
```

### Template: Chat Escalated 🔴

```json
[
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "🔴 CHAT ESCALATED TO SUPPORT",
      "emoji": true
    }
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*👤 User:*\n{{ $json.user_name }}"
      },
      {
        "type": "mrkdwn",
        "text": "*🏷️ Fins+:*\n{{ $json.fins_plus ? 'Yes' : 'No' }}"
      }
    ]
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*📧 Email:*\n{{ $json.email || 'Not provided' }}"
      },
      {
        "type": "mrkdwn",
        "text": "*👤 Forum:*\n{{ $json.forum_username ? '@' + $json.forum_username : 'N/A' }}"
      }
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*🛠️ Product:*\n{{ $json.product }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*❓ Problem:*\n{{ $json.problem }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*🔍 Attempted Solutions:*\n{{ $json.attempted_solutions }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*⚠️ Escalation Reason:*\n{{ $json.escalation_reason }}"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*⏱️ Time before escalation:*\n{{ $json.duration_estimate }}"
      }
    ]
  },
  {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "📞 Claim This Case",
          "emoji": true
        },
        "style": "primary",
        "value": "claim_{{ $json.session_id }}"
      }
    ]
  },
  {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "🤖 Escalated by Finn AI | {{ $now.format('YYYY-MM-DD HH:mm') }} | cc: <@support-luis> <@support-pedro>"
      }
    ]
  }
]
```

---

## PARTE 4: Checklist de Implementação

### No n8n:

- [ ] Criar workflow "Finn AI - Chat Summary to Slack"
- [ ] Node 1: Execute Workflow Trigger
- [ ] Node 2: Code Node com `format-chat-summary.js`
- [ ] Node 3: Slack Node (Message → Send → Block Kit)
- [ ] Node 4: Respond to Trigger
- [ ] Conectar nodes: Trigger → Code → Slack → Return
- [ ] Testar com dados de exemplo

### No Sub-Agente Finalize Chat:

- [ ] System Prompt: `system prompt tool finalizar chat.md`
- [ ] Tool: Call n8n Workflow → selecionar "Finn AI - Chat Summary to Slack"
- [ ] Description da tool: `send_to_slack`

### No AI Agent Principal:

- [ ] Adicionar tool: finalize_chat (sub-agente)
- [ ] Description: `description tool finalizar chat.md`

---

## PARTE 5: Fluxo Completo de Execução

```
1. Chat chega ao fim (resolvido ou escalado)
   ↓
2. AI Agent Principal chama finalize_chat tool
   ↓
3. Sub-agente Finalize Chat recebe dados da sessão
   ↓
4. Sub-agente gera summary estruturado
   ↓
5. Sub-agente chama send_to_slack tool (Call n8n Workflow)
   ↓
6. Workflow "Chat Summary to Slack" inicia
   ↓
7. Code Node formata dados para Slack Block Kit
   ↓
8. Slack Node envia para #suporte-finn-ai
   │
   ├── ✅ RESOLVED: Mensagem verde com NPS
   │
   └── 🔴 ESCALATED: Mensagem vermelha com botão "Claim"
   ↓
9. Return confirma sucesso
   ↓
10. Sub-agente retorna para AI Agent Principal
   ↓
11. Chat finalizado ✓
```

---

## Diferença: Escalate vs Finalize

| Aspecto | Escalate to Support | Finalize Chat |
|---------|---------------------|---------------|
| **Quando** | Imediatamente ao escalar | Fim de TODO chat |
| **Foco** | Urgência, prioridade | Documentação completa |
| **NPS** | Nunca | Sim (se resolvido) |
| **User Info** | Básico | Completo |
| **Solução** | N/A | Detalhada |
| **Code Node** | parse-escalation-json.js | format-chat-summary.js |
| **Mensagem** | 🚨 ALERT | ✅ RESOLVED ou 🔴 ESCALATED |
