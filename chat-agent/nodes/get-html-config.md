# Node: Getting HTML of User's Website

## Status: OK ✅

O código JavaScript inline no campo URL já tem boa validação:

```javascript
{{
(u => {
  u = String(u || '').trim();
  if (!u) return '';  // ✅ Retorna vazio se não tem URL
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;

  // Converte preview.webflow.com para .webflow.io
  if (u.includes('preview.webflow.com/preview/')) {
    const projectMatch = u.match(/\/preview\/([^?&\/]+)/);
    if (projectMatch) {
      const projectName = projectMatch[1];
      return `https://${projectName}.webflow.io`;
    }
  }

  // Rejeita URLs do designer (não funcionam)
  if (u.includes('webflow.com/design/')) {
    return '';
  }

  // Remove www. de webflow.io e app.*
  u = u.replace(/^https?:\/\/www\.(?=([^/]+\.webflow\.io|app\.))/i, 'https://');

  // Remove query params de .webflow.io
  if (u.includes('.webflow.io')) {
    u = u.split('?')[0];
  }

  return u;
})($json.message?.content)
}}
```

## Comportamento

| Input | Output |
|-------|--------|
| `""` ou `"EMPTY"` | `""` (vazio) - não faz request |
| `"mysite.webflow.io"` | `https://mysite.webflow.io` |
| `"www.mysite.webflow.io"` | `https://mysite.webflow.io` |
| `"preview.webflow.com/preview/mysite"` | `https://mysite.webflow.io` |
| `"webflow.com/design/mysite"` | `""` (vazio) - designer não funciona |

## Ajuste Recomendado

Adicionar validação para `"EMPTY"` que agora pode vir do Convert URL:

```javascript
{{
(u => {
  u = String(u || '').trim();

  // ✅ NOVO: Verificar se é EMPTY do Convert URL
  if (!u || u === 'EMPTY' || u.toLowerCase() === 'empty') return '';

  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;

  // ... resto do código igual
})($json.message?.content)
}}
```

## Headers (OK)

Os headers estão bem configurados:
- `User-Agent`: Chrome padrão
- `Accept`: text/html
- `Accept-Language`: en-US
- `Upgrade-Insecure-Requests`: 1

## Options (OK)

- `Ignore SSL Issues`: true (necessário para alguns staging sites)
- `Timeout`: 60000ms (1 minuto)
