# Finsweet Support Reporting System

Sistema automatizado de relatórios de suporte técnico para o fórum Finsweet.

## 📁 Estrutura do Projeto

```
├── report-generator/          # Gerador de relatórios Slack
│   ├── v1.0.0/               # Versão atual
│   └── README.md             # Documentação do módulo
│
├── topics-mapper/            # Mapper de tópicos do Discourse
│   ├── v1.0.0/               # Versão atual
│   └── README.md             # Documentação do módulo
│
└── README.md                 # Este arquivo
```

## 🚀 Módulos

### 1. Topics Mapper (Hybrid)
Processa dados brutos do Discourse e calcula métricas de SLA.

[Ver documentação completa →](./topics-mapper/README.md)

### 2. Report Generator
Gera relatórios semanais formatados para Slack.

[Ver documentação completa →](./report-generator/README.md)

## 👥 Equipe de Suporte

**Humanos:**
- Support-Luis
- Support-Pedro
- jesse.muiruri

**AI:**
- Support-Finn

## 🔄 Pipeline de Dados

```
Discourse Forum
    ↓
Topics Mapper (processa e calcula SLA)
    ↓
Report Generator (formata relatório)
    ↓
Slack Channel
```

## 📊 Versões Atuais

| Módulo | Versão | Status |
|--------|--------|--------|
| Topics Mapper | v1.0.0 | ✅ Produção |
| Report Generator | v1.0.0 | ✅ Produção |

## 🛠️ Tecnologias

- **Plataforma**: N8N
- **Fonte de Dados**: Discourse API
- **Output**: Slack Markdown

## 📝 Versionamento

Este projeto usa versionamento semântico (SemVer):
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs
