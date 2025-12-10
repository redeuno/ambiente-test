@echo off
echo ========================================
echo PASSO 2: CRIAR PACOTE DO NODE
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Limpando e compilando...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha na compilacao
    pause
    exit /b 1
)

echo.
echo [2/3] Criando pacote .tgz...
call npm pack
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao criar pacote
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando pacote criado...
if exist "mantovani.bruno-n8n-nodes-imobzi-new-1.2.3.tgz" (
    echo [OK] Pacote criado com sucesso!
    echo Arquivo: mantovani.bruno-n8n-nodes-imobzi-new-1.2.3.tgz
) else (
    echo [ERRO] Pacote nao encontrado
    pause
    exit /b 1
)

echo.
echo ========================================
echo Pressione qualquer tecla para continuar...
pause

