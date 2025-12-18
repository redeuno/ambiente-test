# Node: Information Extractor

## Problema Atual
- O texto de input usa `chatInput` duas vezes (Username e User's Message são iguais)
- Quando não há URL na mensagem, a IA pode inventar (ex: example.com)
- Quando não há username, retorna "@" vazio

## Configuração Recomendada para Chat

### Text (Input)
```
User's Message: {{ $('Receive New Discourse Message').item.json.chatInput }}
```

**Nota:** Removido o "Username: @..." pois não faz sentido no chat - o username deve ser extraído DA mensagem se o usuário se identificar.

---

### Attribute 1: Website

**Name:** `Website`

**Type:** `String`

**Description:**
```
Extract the website URL if the user provided one in their message.

RULES:
- Only extract if there's a REAL URL in the message (like https://example.webflow.io or www.mysite.com)
- Return EMPTY STRING "" if no URL is found
- Do NOT invent or guess URLs
- Do NOT return placeholder URLs like "example.com"
- Common patterns: https://..., http://..., www...., *.webflow.io, *.webflow.com

IMPORTANT: If the user did not provide any website URL, return an empty string "". Never make up a URL.
```

**Required:** `false`

---

### Attribute 2: username

**Name:** `username`

**Type:** `String`

**Description:**
```
Extract the user's name if they introduced themselves in the message.

RULES:
- Only extract if the user explicitly stated their name (e.g., "I'm John", "My name is Sarah", "Hi, I'm Alex")
- Return EMPTY STRING "" if no name is provided
- Do NOT invent names
- Do NOT return "@" alone
- Format: Just the name without @ symbol (e.g., "John" not "@John")

IMPORTANT: If the user did not introduce themselves, return an empty string "". Never guess a name.
```

**Required:** `false`

---

## Expected Outputs

### User provides URL and name:
Message: "Hi, I'm John. My site is https://mysite.webflow.io and filters aren't working"
```json
{
  "output": {
    "Website": "https://mysite.webflow.io",
    "username": "John"
  }
}
```

### User provides only URL:
Message: "Filters not working on https://mysite.webflow.io"
```json
{
  "output": {
    "Website": "https://mysite.webflow.io",
    "username": ""
  }
}
```

### User provides neither:
Message: "Hi, I need help with CMS filters"
```json
{
  "output": {
    "Website": "",
    "username": ""
  }
}
```

### User provides only name:
Message: "Hey, I'm Sarah. My CMS Load isn't working"
```json
{
  "output": {
    "Website": "",
    "username": "Sarah"
  }
}
```

---

## Notas Importantes

1. **Não inventar dados** - A IA deve retornar string vazia, não inventar URLs como "example.com"
2. **Required: false** - Ambos os campos devem ser opcionais
3. **Validação downstream** - O node "Convert URL" e "If Website URL" devem validar se o valor não está vazio
