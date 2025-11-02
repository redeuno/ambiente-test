# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-11-02

### 📦 Lançamento Inicial

#### ✨ Adicionado

**Topics Mapper (Hybrid) v1.0.0:**
- Detecção híbrida de suporte oficial
- Cálculo de SLA com diferenciação dia útil/fim de semana
- Performance monitoring integrado
- Mapeamento de 8 categorias de produto
- Validação robusta de dados de entrada
- Detecção especial para Wized (admin OU staff = oficial)
- Emojis de status (🟢 Excellent, ✅ Good, ⚠️ Warning, ❌ Critical)

**Report Generator (Refactored) v1.0.0:**
- Geração de relatórios Slack formatados em Markdown
- Detecção de problemas recorrentes via AI clustering
- Categorização de urgência (Critical, Moderate, Low)
- Glossário de referência rápida
- Breakdown por produto
- Seção de tópicos aguardando resposta
- Correção automática de arrays desalinhados
- Suporte a múltiplos formatos de dados N8N

**Equipe de Suporte:**
- Support-Luis
- Support-Pedro
- jesse.muiruri (humano)
- Support-Finn (AI)

**SLA Configuration:**
- 24h para dias úteis
- 48h para fins de semana
- Thresholds configuráveis

#### 🗂️ Estrutura

- Organização em pastas por módulo
- Versionamento semântico
- README.md por módulo
- Documentação completa

### 🔮 Próximas Versões

#### [1.1.0] - Planejado
- [ ] Adicionar testes unitários
- [ ] Exportação de métricas para dashboard
- [ ] Alertas automáticos para SLA violations
- [ ] Suporte a múltiplos idiomas

#### [1.0.1] - Correções
- [ ] Bug fixes conforme identificados
- [ ] Otimizações de performance

---

## Legenda

- ✨ `Adicionado` para novas funcionalidades
- 🔄 `Modificado` para mudanças em funcionalidades existentes
- 🗑️ `Depreciado` para funcionalidades que serão removidas
- ❌ `Removido` para funcionalidades removidas
- 🐛 `Corrigido` para correções de bugs
- 🔒 `Segurança` para vulnerabilidades corrigidas
