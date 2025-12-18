# Node: Has Images?

## Condição Atual (Discourse)
```
{{ $json.extractedImages.count }} is greater than 0
```

## Condição Atualizada (Chat + Discourse)
```
{{ $json.extractedImages.hasImages }} is equal to true
```

**OU** se preferir manter numérico:
```
{{ $json.extractedImages.count }} is greater than 0
```
(funciona igual pois o count agora soma ambos)

## Output Esperado do Extract Images

### Quando tem imagem do Chat:
```json
{
  "extractedImages": {
    "count": 1,
    "files": [
      {
        "fileName": "Screenshot_1.png",
        "fileSize": "115646 bytes",
        "fileExtension": "png",
        "fileType": "image",
        "mimeType": "image/png"
      }
    ],
    "hasFileUploads": true,
    "urls": [],
    "hasEmbeddedImages": false,
    "hasImages": true,
    "source": "chat_upload"
  }
}
```

### Quando NÃO tem imagem:
```json
{
  "extractedImages": {
    "count": 0,
    "files": [],
    "hasFileUploads": false,
    "urls": [],
    "hasEmbeddedImages": false,
    "hasImages": false,
    "source": "none"
  }
}
```

## Notas
- O código agora detecta imagens tanto do chat (campo `files`) quanto do Discourse (HTML `cooked`)
- A condição `hasImages: true/false` é mais clara para usar no IF
- O campo `source` indica de onde veio a imagem
