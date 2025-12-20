# Configuração Completa: Sub-Agente Escalate to Support

## Arquitetura Atual (UPDATED - December 2024)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINN SUPPORT AGENT (Principal)               │
│                                                                 │
│  Tools:                                                         │
│  ├── Think (sub-agente orquestrador)                           │
│  ├── Finsweet Support Knowledge                                │
│  ├── FAQ Vector Tool                                           │
│  ├── Perplexity Web Search                                     │
│  ├── Voice and Tone Doc                                        │
│  ├── escalate_to_support (sub-agente) ←── ALERTA IMEDIATO      │
│  └── finalize_chat (sub-agente) ←── RESUMO COMPLETO            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

## FLUXO DE MENSAGENS SLACK:

RESOLVED CHATS (1 mensagem):
────────────────────────────────────────────────────────────────────
User confirms → Finalize Chat → format-chat-summary.js → Slack ✅

ESCALATED CHATS (2 mensagens):
────────────────────────────────────────────────────────────────────
1. Escalate to Support → 🚨 URGENT ALERT → Slack (imediato)
2. Finalize Chat → 🔴 COMPLETE SUMMARY → Slack (logo após)

```

---

## PARTE 1: Tool escalate_to_support no Finn Support Agent

### Node Type
`AI Agent` (como sub-agente/tool)

### Description (o que o Finn Support Agent vê)
```
Use this tool ONLY when you cannot adequately help the user after trying all other options. This will escalate the case to human support via Slack notification.

WHEN TO USE:
- Complex technical issue not covered in documentation
- User has tried your suggestions but problem persists
- Bug or unexpected behavior that needs developer investigation
- You don't have enough knowledge to solve the specific issue

WHEN NOT TO USE:
- User just needs more information (ask them instead)
- You haven't tried searching the knowledge bases yet
- Simple questions you can answer with available tools

REQUIRED INPUT (natural language):
Provide a brief summary including:
- What the user's issue is
- What context you collected (product, URL, screenshots, etc.)
- What's still unclear or missing
- Why you need human help

EXAMPLE:
"User is having issues with CMS Filter not working on multi-reference fields. Collected: Product is Attributes v2, has staging URL, provided HTML showing fs-cmsfilter attributes. Missing: specific expected behavior. Need human help because this edge case isn't covered in documentation."

After calling this tool, inform the user that support has been notified.
```

---

## PARTE 2: System Prompt do Sub-Agente escalate_to_support

### System Message
```
You are an internal escalation assistant for Finn AI Support. Your ONLY job is to process escalation requests and send them to human support via Slack.

## YOUR SINGLE TASK

1. Receive escalation information from the main support AI
2. Extract and structure the key details
3. Determine priority level
4. Call the Slack notification tool with formatted data
5. Return confirmation

## HOW TO EXTRACT INFORMATION

From the input message, identify:
- **summary**: The main issue (1-2 sentences)
- **product**: Which Finsweet product (Attributes, Components, Wized, etc.)
- **contextCollected**: What info was gathered (URL, HTML, screenshots, etc.)
- **missingInfo**: What's unclear or not provided
- **reason**: Why AI couldn't solve it

## PRIORITY RULES

Determine priority based on these criteria:

**HIGH** 🔴
- User explicitly mentions "urgent", "deadline", "production issue"
- User is completely blocked and cannot proceed
- Multiple failed attempts mentioned

**MEDIUM** 🟡 (default)
- Complex technical issue
- User frustrated but not blocked
- Edge case not in documentation

**LOW** 🟢
- General question AI couldn't answer
- Nice-to-have feature question
- Non-urgent inquiry

## CALL THE SLACK TOOL

After extracting info, call the "slack_notification" tool with:

{
  "summary": "Brief issue description",
  "product": "Product name or 'Unknown'",
  "contextCollected": "What was gathered",
  "missingInfo": "What's missing",
  "reason": "Why escalating",
  "priority": "high" | "medium" | "low"
}

## RETURN FORMAT

After sending to Slack, return exactly:

{
  "success": true,
  "message": "Escalation sent to support team",
  "priority": "medium"
}

## RULES

- DO NOT engage in conversation
- DO NOT try to solve the user's problem
- DO NOT ask questions
- JUST process the escalation and call the Slack tool
- ALWAYS call the Slack tool - that's your only purpose
```

---

## PARTE 3: Tool Call n8n Workflow Slack (dentro do sub-agente)

### Description
```
Send escalation notification to Slack support channel. Call this tool with the formatted escalation data.

Required fields:
- summary: Brief description of the issue
- product: Finsweet product involved
- contextCollected: Information gathered from user
- missingInfo: What's still unclear
- reason: Why human help is needed
- priority: "high", "medium", or "low"
```

### Workflow Configuration
Selecione o workflow que você criou para notificação Slack.

---

## PARTE 4: Workflow Slack Notification

### Nome do Workflow
```
Finn AI - Slack Escalation
```

### Estrutura
```
[Execute Workflow Trigger] → [Slack Node] → [Return to Trigger]
```

### Node 1: Execute Workflow Trigger
- Tipo: Execute Workflow Trigger

### Node 2: Slack
- **Credential:** Sua credencial Slack
- **Resource:** Message
- **Operation:** Send a Message
- **Channel:** `#suporte-finn-ai` (ou o ID do canal)

**Text (ou Block Kit se preferir):**
```
🚨 *Finn AI - Escalation Request*

*Priority:* {{ $json.priority.toUpperCase() }} {{ $json.priority === 'high' ? '🔴' : $json.priority === 'medium' ? '🟡' : '🟢' }}
*Product:* {{ $json.product || 'Not identified' }}

━━━━━━━━━━━━━━━━━━━━━━

📋 *Issue Summary:*
{{ $json.summary }}

✅ *Context Collected:*
{{ $json.contextCollected || 'None' }}

❓ *Missing Info:*
{{ $json.missingInfo || 'None specified' }}

💡 *Escalation Reason:*
{{ $json.reason }}

━━━━━━━━━━━━━━━━━━━━━━

🤖 Escalated by Finn AI
cc: <@U_LUIS_ID> <@U_PEDRO_ID>
```

### Node 3: Return (ou Respond to Webhook)
```json
{
  "success": true,
  "slackMessageSent": true
}
```

---

## PARTE 5: Fluxo Completo com Finalize Chat

**IMPORTANTE:** Após chamar `escalate_to_support`, o agente TAMBÉM deve chamar `finalize_chat` para enviar o resumo completo.

### Sequência para Escalação:

```
1. Agente detecta que não consegue resolver
   ↓
2. Chama escalate_to_support (ALERTA IMEDIATO)
   → Envia 🚨 para Slack com prioridade
   ↓
3. Informa usuário que suporte foi acionado
   ↓
4. Chama finalize_chat (RESUMO COMPLETO)
   → Envia 🔴 ESCALATED summary com:
   - User info (nome, email, forum, Fins+)
   - Problema detalhado
   - Soluções tentadas
   - Razão da escalação
   - Tempo estimado
```

O system prompt do **Finn Support Agent** já está configurado corretamente com a referência à tool de escalonamento. A seção relevante já diz:

```
### Step 7: Evaluate Response Quality (INTERNAL)
...
**ESCALATION RULE - When you cannot adequately help:**
Use the **Escalate to Support** tool to notify the human support team.
```

E nas tools disponíveis:
```
6. **Escalate to Support** – Notify human support team via Slack (USE WHEN NEEDED)
```

---

## PARTE 6: Não precisa mudar o Think Tool

O Think tool é para orquestração de análise (COLLECT/ANALYZE/VALIDATE), não tem relação com escalonamento. O escalonamento é uma decisão do agente principal baseada na avaliação de qualidade.

---

## Checklist de Implementação

### No Sub-Agente escalate_to_support:
- [ ] Colar a **Description** (Parte 1)
- [ ] Colar o **System Message** (Parte 2)
- [ ] Conectar o **Anthropic Chat Model**

### Na Tool Call n8n Workflow Slack:
- [ ] Colar a **Description** (Parte 3)
- [ ] Selecionar o **Workflow** de notificação Slack

### No Workflow de Slack:
- [ ] Criar workflow com **Execute Workflow Trigger**
- [ ] Configurar **Slack Node** com a mensagem (Parte 4)
- [ ] Adicionar **Return** node

---

## Fluxo Completo de Execução

```
1. Usuário faz pergunta complexa
   ↓
2. Finn Support Agent tenta resolver
   ↓
3. Não consegue → decide escalar
   ↓
4. Chama tool "escalate_to_support" com resumo
   ↓
5. Sub-agente recebe, extrai dados, define prioridade
   ↓
6. Sub-agente chama "Call n8n Workflow Slack"
   ↓
7. Workflow envia mensagem para #suporte-finn-ai
   ↓
8. Retorna confirmação para sub-agente
   ↓
9. Sub-agente retorna para Finn Support Agent
   ↓
10. Finn Support Agent informa usuário:
    "Acionei nosso time de suporte! Eles vão te ajudar em breve."
```
