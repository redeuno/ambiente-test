# Weekly Report Generator

Gerador de relatórios semanais de suporte técnico para Slack.

## Versões

### v1.0.0 (Atual)
- Data: 2 Nov 2025
- Status: ✅ Produção
- Arquivo: `v1.0.0/weekly-report-generator-refactored.js`

**Funcionalidades:**
- Gera relatórios semanais formatados para Slack
- Calcula métricas de SLA (24h dias úteis, 48h fins de semana)
- Detecta problemas recorrentes com clustering AI
- Diferencia respostas humanas vs AI
- Categoriza tópicos por urgência (Critical, Moderate, Low)

**Equipe de Suporte:**
- Humanos: Support-Luis, Support-Pedro, jesse.muiruri
- AI: Support-Finn

**Produtos Suportados:**
- Components
- Attributes v1/v2
- CMS Bridge
- Wized (com detecção especial de admin)
- Extension
- Consent Pro

## Histórico de Mudanças

### v1.0.0 (2 Nov 2025)
- ✅ Adicionado jesse.muiruri à equipe de suporte
- ✅ Atualizado glossário e overview com Jesse
- ✅ Suporte a múltiplos formatos de dados (N8N)
- ✅ Correção automática de arrays desalinhados
- ✅ Detecção automática de admin Wized

## Uso

Este script é executado em ambiente N8N e processa dados do fórum Discourse.

**Input:** Array de items com dados processados do mapper
**Output:** Relatório formatado em Markdown para Slack

## Dependências

- N8N workflow environment
- Input do weekly-topics-mapper
