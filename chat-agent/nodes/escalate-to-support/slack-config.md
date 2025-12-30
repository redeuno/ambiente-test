# Escalate to Support - Configuração Completa

## Arquitetura (UPDATED - December 2024)

### DOIS TIPOS DE MENSAGEM SLACK

```
┌─────────────────────────────────────────────────────────────────┐
│ MENSAGEM 1: ALERTA IMEDIATO (Escalate to Support)              │
│                                                                 │
│ 🚨 *Finn AI - Escalation Request*                              │
│ Priority: HIGH 🔴                                               │
│ Product: CMS Filter                                             │
│ Issue: Brief summary...                                         │
│ Reason: Why escalating...                                       │
│                                                                 │
│ → Enviado IMEDIATAMENTE quando escalação é triggerada           │
│ → Foco em URGÊNCIA e PRIORIDADE                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MENSAGEM 2: RESUMO COMPLETO (Finalize Chat)                    │
│                                                                 │
│ 🔴 *CHAT ESCALATED TO SUPPORT*                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                  │
│ 👤 User: Maria                                                  │
│ 📧 maria@email.com | @maria_dev                                 │
│ 🏷️ Fins+: Yes                                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                  │
│ 🛠️ Product: CMS Nest (Attributes)                               │
│ ❓ Problem: Detailed description...                             │
│ 🔍 Attempted: Solutions tried...                                │
│ ⚠️ Escalation Reason: Why...                                    │
│                                                                 │
│ → Enviado LOGO APÓS o alerta imediato                          │
│ → Foco em DOCUMENTAÇÃO COMPLETA                                │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Nodes

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENT PRINCIPAL                           │
│                                                                 │
│  Tools:                                                         │
│  - Think Tool                                                   │
│  - Finsweet Support Knowledge                                   │
│  - FAQ Vector Tool                                              │
│  - Escalate to Support ←── ALERTA IMEDIATO                     │
│  - Finalize Chat ←── RESUMO COMPLETO (SEMPRE ao final)         │
│                                                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐     ┌───────────────────┐
│ Escalate Support  │     │  Finalize Chat    │
│ (Alerta Imediato) │     │ (Resumo Completo) │
└────────┬──────────┘     └────────┬──────────┘
         │                         │
         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐
│ parse-escalation  │     │ format-chat-summ  │
│ -json.js          │     │ ary.js            │
└────────┬──────────┘     └────────┬──────────┘
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MESMO CANAL SLACK                            │
│                    #suporte-finn-ai                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## PARTE 1: Tool no AI Agent Principal

### Tool Name
```
escalate_to_support
```

### Tool Description
```
Use this tool ONLY when you cannot adequately help the user after trying all other options. This will notify the human support team via Slack.

WHEN TO USE:
- Complex technical issue not covered in documentation
- User has tried your suggestions but problem persists
- You don't have enough knowledge to solve the issue
- Bug or unexpected behavior that needs developer investigation

WHEN NOT TO USE:
- User just needs more information (ask them instead)
- You haven't tried searching the knowledge bases yet
- Simple questions you can answer

REQUIRED INPUT:
- summary: Brief description of the user's issue (1-2 sentences)
- contextCollected: What information you gathered (product, URL, etc.)
- missingInfo: What's still unclear or missing
- reason: Why you need human help (be specific)

After calling this tool, inform the user that support has been notified and will help soon.
```

### ⚠️ Sobre Output Schema

O **Output Schema** na tool define o que o AI Agent **envia para a tool**, NÃO afeta a resposta ao usuário.

Você pode deixar vazio ou configurar assim (opcional):

```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the escalation was sent successfully"
    },
    "message": {
      "type": "string",
      "description": "Confirmation message"
    }
  }
}
```

Mas isso é **opcional** - o importante é o Input Schema.

---

## PARTE 2: Sub-Agente de Escalação

### Node: AI Agent (Sub-Agente)

**Name:** `Escalation Agent`

**System Prompt:**
```
You are an internal escalation assistant. Your ONLY job is to format escalation requests and send them to human support via Slack.

## YOUR TASK

1. Receive escalation data from the main support AI
2. Format it into a clear, structured message
3. Call the Slack notification workflow
4. Return confirmation

## INPUT YOU WILL RECEIVE

- summary: Brief description of the issue
- contextCollected: Information gathered from user
- missingInfo: What's unclear or missing
- reason: Why AI couldn't help
- sessionId: Chat session identifier
- category: Product category if identified

## OUTPUT FORMAT

Create a structured escalation with:
- Clear issue summary
- Bullet points of collected context
- What's missing
- Reason for escalation
- Priority level (high/medium/low)

## PRIORITY RULES

- HIGH: User is blocked, production issue, urgent deadline mentioned
- MEDIUM: User frustrated, tried multiple solutions, complex issue
- LOW: General question AI couldn't answer, non-urgent

## AFTER SENDING

Return a simple confirmation:
{
  "success": true,
  "message": "Escalation sent to support team",
  "priority": "medium"
}

DO NOT engage in conversation. Just process the escalation and return.
```

### User Message do Sub-Agente

```
Process this escalation request:

Session ID: {{ $json.sessionId }}
Category: {{ $json.category }}

Summary: {{ $json.summary }}

Context Collected:
{{ $json.contextCollected }}

Missing Information:
{{ $json.missingInfo }}

Reason for Escalation:
{{ $json.reason }}

Format this and send to Slack support channel.
```

---

## PARTE 3: Workflow de Notificação Slack

### Workflow Name
```
Slack Support Escalation
```

### Estrutura
```
[Execute Workflow Trigger] → [Set Node] → [Slack Node] → [Respond to Trigger]
```

### Node 1: Execute Workflow Trigger

**Webhook Type:** Execute Workflow Trigger (para ser chamado por outro workflow)

### Node 2: Set Node (Formatar Dados)

**Name:** `Format Escalation Data`

**Fields:**

| Field | Value |
|-------|-------|
| sessionId | `{{ $json.sessionId }}` |
| category | `{{ $json.category \|\| 'Not identified' }}` |
| summary | `{{ $json.summary }}` |
| context | `{{ $json.contextCollected }}` |
| missing | `{{ $json.missingInfo \|\| 'None specified' }}` |
| reason | `{{ $json.reason }}` |
| priority | `{{ $json.priority \|\| 'medium' }}` |
| timestamp | `{{ $now.format('YYYY-MM-DD HH:mm:ss') }}` |

### Node 3: Slack Node

**Credential:** Sua credencial Slack

**Resource:** Message

**Operation:** Send

**Channel:** `#suporte-finn-ai` (ou ID do canal)

**Message Type:** Block Kit

**Blocks:**
```json
[
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
        "text": "*Priority:*\n{{ $json.priority.toUpperCase() }} {{ $json.priority === 'high' ? '🔴' : $json.priority === 'medium' ? '🟡' : '🟢' }}"
      },
      {
        "type": "mrkdwn",
        "text": "*Category:*\n{{ $json.category }}"
      }
    ]
  },
  {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": "*Session ID:*\n`{{ $json.sessionId }}`"
      },
      {
        "type": "mrkdwn",
        "text": "*Time:*\n{{ $json.timestamp }}"
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
      "text": "*📋 Issue Summary:*\n{{ $json.summary }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*✅ Context Collected:*\n{{ $json.context }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*❓ Missing Info:*\n{{ $json.missing }}"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*💡 Escalation Reason:*\n{{ $json.reason }}"
    }
  },
  {
    "type": "divider"
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
        "value": "claim_{{ $json.sessionId }}"
      }
    ]
  },
  {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "🤖 Escalated by Finn AI | cc: <@support-luis> <@support-pedro>"
      }
    ]
  }
]
```

### Node 4: Respond to Trigger

**Response:**
```json
{
  "success": true,
  "message": "Escalation sent successfully",
  "slackMessageId": "{{ $json.ts }}"
}
```

---

## PARTE 4: Conectar Tudo

### No AI Agent Principal

1. Vá em **Tools**
2. Clique **Add Tool**
3. Selecione **Call n8n Workflow**
4. **Workflow:** Selecione o workflow do Sub-Agente
5. Configure os campos de entrada

### Input Fields da Tool

| Campo | Source Expression |
|-------|-------------------|
| sessionId | `{{ $json.sessionId }}` |
| category | `{{ $json.category }}` |
| summary | *(AI preenche)* |
| contextCollected | *(AI preenche)* |
| missingInfo | *(AI preenche)* |
| reason | *(AI preenche)* |

---

## PARTE 5: Resposta ao Usuário

Após chamar a tool, o AI Agent principal deve responder ao usuário com algo como:

```
Entendi sua situação! 🙏

Acabei de acionar nosso time de suporte especializado para te ajudar com esse caso.

Um dos nossos especialistas vai analisar e entrar em contato em breve.

Enquanto isso, se lembrar de mais algum detalhe que possa ajudar, é só me contar aqui!
```

O AI faz isso automaticamente baseado no system prompt - não precisa configurar nada extra.

---

## Resumo Visual

```
┌────────────────────────────────────────────────────┐
│           USUÁRIO ENVIA MENSAGEM                   │
└─────────────────────┬──────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────┐
│           AI AGENT PRINCIPAL                       │
│                                                    │
│  1. Tenta resolver com knowledge bases             │
│  2. Se não consegue → chama escalate_to_support    │
│                                                    │
└─────────────────────┬──────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────┐
│           SUB-AGENTE: Escalation                   │
│                                                    │
│  1. Recebe dados do problema                       │
│  2. Define prioridade                              │
│  3. Chama Slack Workflow                           │
│                                                    │
└─────────────────────┬──────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────┐
│           WORKFLOW: Slack Notification             │
│                                                    │
│  1. Formata mensagem bonita                        │
│  2. Envia para #suporte-finn-ai                    │
│  3. Menciona @support-luis @support-pedro          │
│                                                    │
└─────────────────────┬──────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────┐
│           RESPOSTA AO USUÁRIO                      │
│                                                    │
│  "Acionei nosso time de suporte! Eles vão te      │
│   ajudar em breve."                                │
│                                                    │
└────────────────────────────────────────────────────┘
```
