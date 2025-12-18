# Nodes de Processamento de Imagens

## Fluxo de Imagens
```
Has Images? → Describe Screenshot → Aggregate → Format Image → Merge
```

---

## 1. Extract Images (já documentado)

O código `extract-images-code.js` já foi atualizado para detectar imagens do chat.

**Importante:** No n8n Chat, os arquivos binários vêm em um campo separado. Precisamos garantir que os dados binários sejam passados.

---

## 2. Has Images? (IF Node)

### Condição
```
{{ $json.extractedImages.hasImages }} is equal to true
```

**Status:** OK ✅

---

## 3. Describe Screenshot (Analyze Image)

### Status: Precisa Verificar ⚠️

**Configuração atual:**
- Resource: Image
- Operation: Analyze Image
- Model: GPT-4O-MINI
- Input Type: Binary File(s)
- Input Data Field Name: `data`

### Problema
No chat, os arquivos binários podem estar em um campo diferente. Verifique se o campo `data` contém os dados binários.

### Text Input (atualizado para chat)
```
Analyze this screenshot from a Finsweet support chat. Describe:

1. What UI elements are visible (buttons, inputs, code, console errors)
2. What the user is trying to show or demonstrate
3. Any error messages or issues visible
4. Technical details that would help diagnose the problem
5. Any Finsweet attributes (fs-*) visible in the code/inspector

Be specific and detailed. This is screenshot #{{ $itemIndex + 1 }}.
```

### Verificação de Dados Binários

No n8n, para chat files, os dados binários geralmente estão em:
- `$binary.data` - Campo binário padrão
- `$binary.file` - Alternativo
- `$json.files[0].data` - Se inline

**Se os dados binários não estiverem chegando**, pode ser necessário adicionar um node "Convert to File" ou "HTTP Request" para baixar a imagem se vier como URL.

---

## 4. Aggregate Image Descriptions

### Configuração
- Aggregate: All Item Data (Into a Single List)
- Put Output in Field: `descriptions`
- Include: All Fields

**Status:** OK ✅

---

## 5. Format Image (Code Node)

### Código Atual - OK ✅

```javascript
// Get the aggregated descriptions
const descriptions = $json.descriptions || [];

// If no images were processed
if (!descriptions || descriptions.length === 0) {
  return {
    imageAnalysis: {
      description: "No images found in this post.",
      analyzed: false,
      imageCount: 0
    }
  };
}

// Combine all descriptions
let combinedDescription = "";

descriptions.forEach((item, index) => {
  const content = item.content || "No description available";

  if (index > 0) {
    combinedDescription += "\n\n";
  }

  if (descriptions.length > 1) {
    combinedDescription += `--- Screenshot ${index + 1} ---\n`;
  }

  combinedDescription += content;
});

return {
  imageAnalysis: {
    description: combinedDescription.trim(),
    analyzed: true,
    imageCount: descriptions.length
  }
};
```

---

## 6. Merge Node

Junta o branch de imagens com o branch principal.

**Status:** OK ✅

---

## Problema Principal: Dados Binários no Chat

No seu input, os dados binários estão `null`:
```json
{
  "data": null,
  "url": null,
  "binaryPropertyName": null
}
```

### Solução 1: Verificar como o n8n Chat envia arquivos

No n8n Chat, os arquivos geralmente vêm como dados binários separados. Verifique se existe um campo `$binary` no input.

### Solução 2: Atualizar Extract Images para capturar binários

```javascript
// No extract-images-code.js, adicionar:
const chatFiles = item.json?.files || [];
const binaryData = item.binary || {};

if (chatFiles.length > 0) {
  for (let i = 0; i < chatFiles.length; i++) {
    const file = chatFiles[i];
    const binaryKey = `file${i}` || `data${i}` || Object.keys(binaryData)[i];

    if (file.fileType === 'image' || file.mimeType?.startsWith('image/')) {
      imageFiles.push({
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        // Tentar pegar dados binários
        binaryPropertyName: binaryKey || null,
        hasBinary: !!binaryData[binaryKey]
      });
    }
  }
}
```

### Solução 3: Adicionar node para processar binários

Se os dados binários estiverem em `$binary`, pode ser necessário adicionar um "Set" node para mapear corretamente antes do "Analyze Image".

---

## Debugging

Para debugar, adicione um "Code" node temporário antes do "Describe Screenshot":

```javascript
// Debug: ver estrutura completa do input
return {
  json: $json,
  binary: $binary || 'no binary',
  inputKeys: Object.keys($input.item),
  binaryKeys: $binary ? Object.keys($binary) : []
};
```

Isso vai mostrar onde estão os dados binários.

---

## Resumo

| Node | Status |
|------|--------|
| Has Images? | OK ✅ |
| Describe Screenshot | Verificar campo binário ⚠️ |
| Aggregate | OK ✅ |
| Format Image | OK ✅ |
| Merge | OK ✅ |

**Ação necessária:** Verificar como os dados binários chegam do chat e ajustar o campo `Input Data Field Name` no node "Describe Screenshot".
