@echo off
echo ========================================
echo PASSO 1: INSTALAR N8N LOCALMENTE
echo ========================================
echo.

echo Verificando se n8n ja esta instalado...
where n8n >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] n8n ja esta instalado!
    n8n --version
) else (
    echo [INSTALANDO] n8n globalmente...
    npm install -g n8n
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar n8n
        pause
        exit /b 1
    )
    echo [OK] n8n instalado com sucesso!
)

echo.
echo ========================================
echo Pressione qualquer tecla para continuar...
pause

