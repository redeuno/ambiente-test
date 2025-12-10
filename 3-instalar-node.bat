@echo off
echo ========================================
echo PASSO 3: INSTALAR NODE NO N8N LOCAL
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Criando pasta de nodes custom...
if not exist "%USERPROFILE%\.n8n\nodes" mkdir "%USERPROFILE%\.n8n\nodes"
cd /d "%USERPROFILE%\.n8n\nodes"

echo.
echo [2/4] Inicializando npm...
if not exist "package.json" (
    echo {"name":"n8n-custom-nodes","version":"1.0.0"} > package.json
)

echo.
echo [3/4] Instalando o node...
set PACKAGE_PATH=%~dp0mantovani.bruno-n8n-nodes-imobzi-new-1.2.3.tgz
call npm install "%PACKAGE_PATH%"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar node
    pause
    exit /b 1
)

echo.
echo [4/4] Limpando cache do n8n...
if exist "%USERPROFILE%\.n8n\cache" (
    rmdir /s /q "%USERPROFILE%\.n8n\cache"
    echo [OK] Cache limpo
)

echo.
echo [OK] Node instalado com sucesso!
echo Localizacao: %USERPROFILE%\.n8n\nodes\node_modules\@mantovani.bruno\n8n-nodes-imobzi-new

echo.
echo ========================================
echo Pressione qualquer tecla para continuar...
pause

