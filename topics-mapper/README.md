# Weekly Topics Mapper (Hybrid)

Mapeia e processa tópicos do fórum Discourse, detectando respostas oficiais e calculando SLA.

## Versões

### v1.0.0 (Atual)
- Data: 2 Nov 2025
- Status: ✅ Produção
- Arquivo: `v1.0.0/weekly-topics-mapper-hybrid.js`

**Funcionalidades:**
- Mapeia tópicos do Discourse para estrutura processável
- Detecta respostas oficiais (método híbrido)
- Calcula SLA por tipo de dia (útil vs fim de semana)
- Tracking de tempo de resposta
- Performance monitoring integrado

**Detecção Híbrida de Suporte:**
- **Padrão**: Support-Finn, Support-Luis, Support-Pedro, jesse.muiruri
- **Wized (Categoria 22)**: Admin OU Staff = oficial

**SLA Configuration:**
- Dias úteis: 24h
- Fins de semana: 48h
- Thresholds: Excellent (95%), Good (85%), Warning (70%)

## Mapeamento de Categorias

| ID | Categoria |
|----|-----------|
| 5  | Attributes |
| 7  | Community |
| 14 | Finsweet Components |
| 18 | CMS Bridge |
| 22 | Wized |
| 3  | Staff |
| 8  | Extension |
| 24 | Consent Pro |

## Histórico de Mudanças

### v1.0.0 (2 Nov 2025)
- ✅ Adicionado jesse.muiruri ao STANDARD_SUPPORT
- ✅ Detecção híbrida para Wized (admin OU staff)
- ✅ Performance monitoring
- ✅ Cálculo avançado de SLA com emojis
- ✅ Validação robusta de dados

## Uso

Este script processa dados brutos do Discourse e prepara para o report generator.

**Input:** Posts do Discourse via N8N
**Output:** Array estruturado com métricas calculadas

## Pipeline

```
Discourse API
    ↓
weekly-topics-mapper-hybrid.js (este arquivo)
    ↓
weekly-report-generator-refactored.js
    ↓
Slack Report
```

## Dependências

- N8N workflow environment
- Discourse API data
