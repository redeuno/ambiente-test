# ========================================
# SCRIPT DE LIMPEZA COMPLETA DO N8N
# Execute este script como ADMINISTRADOR
# ========================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA COMPLETA DO N8N" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. PARAR TODOS OS PROCESSOS DO N8N
Write-Host "[1/6] Parando processos do n8n..." -ForegroundColor Yellow
Get-Process -Name "*n8n*" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✓ Processos parados" -ForegroundColor Green
Write-Host ""

# 2. LIMPAR CACHE DO NPM
Write-Host "[2/6] Limpando cache do NPM..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Cache do NPM limpo" -ForegroundColor Green
Write-Host ""

# 3. LIMPAR CACHE DO N8N
Write-Host "[3/6] Limpando cache do n8n..." -ForegroundColor Yellow
$n8nCachePath = "$env:USERPROFILE\.n8n\cache"
if (Test-Path $n8nCachePath) {
    Remove-Item -Path "$n8nCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Cache do n8n limpo" -ForegroundColor Green
} else {
    Write-Host "ℹ Cache do n8n não existe ainda" -ForegroundColor Gray
}
Write-Host ""

# 4. LIMPAR NODE_MODULES LOCAIS DO N8N (se existir)
Write-Host "[4/6] Limpando node_modules do n8n..." -ForegroundColor Yellow
$n8nNodeModules = "$env:USERPROFILE\.n8n\node_modules"
if (Test-Path $n8nNodeModules) {
    Remove-Item -Path $n8nNodeModules -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ node_modules limpo" -ForegroundColor Green
} else {
    Write-Host "ℹ node_modules não existe" -ForegroundColor Gray
}
Write-Host ""

# 5. DESINSTALAR VERSÃO ANTIGA DO PACOTE
Write-Host "[5/6] Desinstalando versão antiga..." -ForegroundColor Yellow
npm uninstall -g @mantovani.bruno/n8n-nodes-imobzi-new 2>$null
Write-Host "✓ Versão antiga removida" -ForegroundColor Green
Write-Host ""

# 6. INSTALAR VERSÃO NOVA
Write-Host "[6/6] Instalando versão 1.0.5..." -ForegroundColor Yellow
npm install -g @mantovani.bruno/n8n-nodes-imobzi-new@1.0.5
Write-Host "✓ Versão 1.0.5 instalada" -ForegroundColor Green
Write-Host ""

# RESUMO FINAL
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Reinicie o computador (recomendado)" -ForegroundColor White
Write-Host "2. Abra um novo terminal" -ForegroundColor White
Write-Host "3. Execute: n8n start" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

