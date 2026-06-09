# ─────────────────────────────────────────────────────────────────
#  ÍNDIO HUB — Configurar ANTHROPIC_API_KEY no Vercel
#  Execute com: botão direito → "Executar com PowerShell"
# ─────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   ÍNDIO HUB — Configurar Chave da API Claude  ║" -ForegroundColor Cyan
Write-Host "  ╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Esta chave permite que o Hub converse diretamente" -ForegroundColor White
Write-Host "  com a IA Claude sem precisar de copy-paste." -ForegroundColor White
Write-Host ""
Write-Host "  Como obter sua chave:" -ForegroundColor Yellow
Write-Host "  1. Acesse: https://console.anthropic.com" -ForegroundColor Yellow
Write-Host "  2. API Keys → Create Key (ou use uma existente)" -ForegroundColor Yellow
Write-Host ""

$apiKey = Read-Host "  Cole sua ANTHROPIC_API_KEY aqui (sk-ant-api03-...)"

if (-not $apiKey -or -not $apiKey.StartsWith("sk-ant-")) {
    Write-Host ""
    Write-Host "  ❌ Chave inválida. Deve começar com sk-ant-" -ForegroundColor Red
    Read-Host "  Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "  ✅ Chave recebida. Configurando no Vercel..." -ForegroundColor Green

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

# Adicionar ao Vercel (production, preview e development)
$apiKey | npx vercel env add ANTHROPIC_API_KEY production --scope wagnersuperindio-8696s-projects --yes 2>&1
$apiKey | npx vercel env add ANTHROPIC_API_KEY preview --scope wagnersuperindio-8696s-projects --yes 2>&1

# Atualizar .env.local também
"ANTHROPIC_API_KEY=$apiKey" | Out-File -FilePath ".env.local" -Encoding utf8 -Force

Write-Host ""
Write-Host "  🚀 Fazendo novo deploy com a chave configurada..." -ForegroundColor Cyan
npx vercel --prod --yes --scope wagnersuperindio-8696s-projects 2>&1 | Select-String -Pattern "(ready|error|Error|✓|https://)" | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "  ✅ Pronto! Acesse: https://indio-hub.vercel.app" -ForegroundColor Green
Write-Host ""
Read-Host "  Pressione Enter para fechar"
