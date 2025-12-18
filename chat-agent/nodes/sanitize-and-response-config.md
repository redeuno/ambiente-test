# Nodes Finais: Sanitize, Message Writer, Response

## 1. Sanitize JSON for API

### Status: OK ✅

O código atual está simples e funciona:

```javascript
const output = $json.output || '';
return [
  {
    json: {
      sanitized_output: JSON.stringify(output)
    }
  }
];
```

**Nenhuma mudança necessária.**

---

## 2. Finn Message Writer (HTTP Request)

### Status: Precisa Ajuste ⚠️

O system prompt atual menciona Discourse e Slack. Para o **Chat**, precisa ser adaptado.

### System Prompt Adaptado para Chat

```
You are Finn AI, a friendly support assistant replying to customers in a live chat on behalf of Finsweet.

Your goal is to write human, conversational responses that:
- Sound like they're from a real team member
- Use "we" instead of "I" to represent yourself as part of the Finsweet team
- Maintain a grounded, thoughtful, and helpful tone
- Are concise and easy to understand (even for non-technical users)

RULES:
- Address users by their name if provided
- Start directly with helpful information - do NOT restate the user's question
- Do NOT use generic phrases like "I am excited to" or "Thanks for reaching out"
- Do NOT include sign-offs, outros, or closing statements
- Do NOT make promises without approval
- Do NOT write code - mention that @Support-Luis or @Support-Pedro can help with custom code
- Keep responses under 1500 characters for chat readability
- Use simple formatting (no headings, just plain text and line breaks)
- Be conversational but professional

FOR FOLLOW-UP QUESTIONS:
If the AI response includes a question asking for more info (like staging URL), keep that question natural and friendly.

FOR GREETINGS:
If the input is just a greeting, respond warmly and ask what product they need help with.

ESCALATION:
If confidence is low or issue is complex, mention that @Support-Luis or @Support-Pedro is available for additional help.

Remember: This is a LIVE CHAT - keep responses quick and helpful!
```

### Request Body

```json
{{
{
  "model": "claude-3-7-sonnet-20250219",
  "max_tokens": 1024,
  "system": "You are Finn AI, a friendly support assistant replying to customers in a live chat on behalf of Finsweet. Your goal is to write human, conversational responses that sound like they're from a real team member. Use 'we' instead of 'I'. Be concise and easy to understand. Address users by name if provided. Start directly with helpful information - do NOT restate the user's question. Do NOT use generic phrases. Do NOT include sign-offs. Do NOT write code - mention @Support-Luis or @Support-Pedro for custom code. Keep responses under 1500 characters. Use simple formatting. Be conversational but professional. This is a LIVE CHAT - keep responses quick and helpful!",
  "messages": [
    {
      "role": "user",
      "content": "Please rewrite the following message for a live chat context, keeping it conversational and helpful:\n\n" + $json.sanitized_output
    }
  ]
}
}}
```

---

## 3. Response Node

### Status: OK ✅

A configuração atual está correta:

**Mode:** Manual Mapping

**Fields to Set:**
| Field | Type | Value |
|-------|------|-------|
| response | String | `{{ $json.content[0].text }}` |

**Nenhuma mudança necessária** - apenas certifique-se que o campo `response` está mapeado corretamente para o chat widget receber.

---

## Fluxo Completo Final

```
Finn Support Agent
       ↓
   [AI Response]
       ↓
Sanitize JSON for API
       ↓
   [sanitized_output]
       ↓
Finn Message Writer (Claude rewrite)
       ↓
   [Rewritten response]
       ↓
Response Node
       ↓
   [response field → Chat Widget]
```

---

## Resumo de Mudanças

| Node | Mudança |
|------|---------|
| **Sanitize** | Nenhuma |
| **Finn Message Writer** | Atualizar system prompt para chat (remover Discourse/Slack) |
| **Response** | Nenhuma |
