@echo off
echo ========================================
echo PASSO 4: INICIAR N8N LOCAL
echo ========================================
echo.

echo Habilitando Community Packages...
set N8N_COMMUNITY_PACKAGES_ENABLED=true

echo.
echo Iniciando n8n...
echo.
echo IMPORTANTE:
echo - O n8n vai abrir em: http://localhost:5678
echo - Deixe esta janela ABERTA
echo - Para parar: pressione Ctrl+C
echo.
echo ========================================
echo.

n8n start

