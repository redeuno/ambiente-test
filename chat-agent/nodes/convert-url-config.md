# Node: Convert URL

## Problema Atual
Quando o Information Extractor retorna `Website: ""` (vazio), este node ainda tenta processar e a IA pode inventar uma URL como "https://www.example.com".

## Solução
Adicionar regra explícita para retornar vazio quando input for vazio.

---

## Configuração Recomendada

### System Prompt (Role: System)
```
You are an expert in validating and normalizing website URLs.

CRITICAL RULE - EMPTY INPUT:
- If the input is empty, blank, whitespace-only, or contains only special characters, return EXACTLY: EMPTY
- Do NOT invent, guess, or create any URL
- Do NOT return example.com, placeholder.com, or any made-up domain

For VALID URLs, normalize them:
1. Ensure it has the "https://" prefix.
2. Add "www." to the hostname if it's missing **except** when the domain ends with ".webflow.io".
3. If the domain ends with ".webflow.io" and starts with "www.", remove the "www." prefix (these fail TLS handshakes).
4. Clean whitespace and encoding issues.
5. Return only the corrected URL — no commentary, no explanation, no markdown, no quotes.

Examples:
- Input: "" → Output: EMPTY
- Input: "   " → Output: EMPTY
- Input: "mysite.webflow.io" → Output: https://mysite.webflow.io
- Input: "www.example.com" → Output: https://www.example.com
- Input: "https://test.com" → Output: https://www.test.com
```

### User Message (Role: User)
```
Normalize this URL so it becomes valid and safe for HTTPS requests.

IMPORTANT: If the input below is empty or invalid, return exactly "EMPTY" - do not invent a URL.

Follow the rules:
- If input is empty/blank → return "EMPTY"
- Add https:// if it doesn't exist.
- Add www. if missing (unless it's a *.webflow.io domain).
- Remove www. if the domain ends with .webflow.io.

Here is the input URL to fix:
{{ $json.output.Website }}
```

---

## Outputs Esperados

| Input | Output |
|-------|--------|
| `""` | `EMPTY` |
| `"   "` | `EMPTY` |
| `mysite.webflow.io` | `https://mysite.webflow.io` |
| `www.mysite.webflow.io` | `https://mysite.webflow.io` |
| `example.com` | `https://www.example.com` |
| `https://test.com` | `https://www.test.com` |

---

## Ajuste no Node "If Website URL is Included"

Após esta mudança, a condição do IF deve verificar:

### Condição Atual:
```
{{ $('Information Extractor').item.json.output.Website }} exists
```

### Condição Atualizada:
```
{{ $json.message.content }} is not equal to EMPTY
```

**E adicionar segunda condição:**
```
{{ $json.message.content }} does not contain example.com
```

**OU usar uma condição JavaScript:**
```javascript
const url = $json.message.content;
return url && url !== 'EMPTY' && url !== '' && !url.includes('example.com');
```

---

## Alternativa: Usar IF Antes do Convert URL

Outra opção é adicionar um IF node ANTES do Convert URL para só processar se tiver URL:

```
{{ $('Information Extractor').item.json.output.Website }} is not empty
```

Isso evita chamar a API do OpenAI desnecessariamente quando não há URL.
