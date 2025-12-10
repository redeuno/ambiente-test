@echo off
cls
echo ========================================
echo INSTALAR E TESTAR NODE IMOBZI NO N8N
echo ========================================
echo.
echo Este script vai:
echo 1. Instalar n8n localmente (se necessario)
echo 2. Compilar e criar pacote do node
echo 3. Instalar o node no n8n
echo 4. Iniciar o n8n
echo.
echo ========================================
echo Pressione qualquer tecla para iniciar...
pause >nul

call 1-instalar-n8n-local.bat
if %errorlevel% neq 0 exit /b 1

call 2-criar-pacote.bat
if %errorlevel% neq 0 exit /b 1

call 3-instalar-node.bat
if %errorlevel% neq 0 exit /b 1

cls
echo ========================================
echo TUDO PRONTO!
echo ========================================
echo.
echo O node foi instalado com sucesso!
echo.
echo Agora vou iniciar o n8n...
echo Acesse: http://localhost:5678
echo.
echo Procure por "Imobzi" nos nodes!
echo.
echo ========================================
echo Pressione qualquer tecla para iniciar o n8n...
pause >nul

call 4-iniciar-n8n.bat

