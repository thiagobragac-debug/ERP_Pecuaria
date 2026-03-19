param(
    [int]$IntervalSeconds = 15,
    [string]$Branch = "main"
)

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

Write-Host "=== Auto Git Push ===" -ForegroundColor Cyan
Write-Host "Verificando mudancas a cada $IntervalSeconds segundos..." -ForegroundColor Cyan
Write-Host "Branch: $Branch" -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar." -ForegroundColor Yellow
Write-Host ""

while ($true) {
    $status = git status --porcelain 2>&1

    if ($status) {
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] Mudancas detectadas:" -ForegroundColor Green
        Write-Host $status -ForegroundColor DarkGray

        git add .

        $commitMsg = "auto: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        $commitOut = git commit -m $commitMsg 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK - Commit: $commitMsg" -ForegroundColor Cyan

            $pushOut = git push origin $Branch 2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-Host "  OK - Push enviado para origin/$Branch" -ForegroundColor Green
            } else {
                Write-Host "  ERRO no push: $pushOut" -ForegroundColor Red
            }
        } else {
            Write-Host "  ERRO no commit: $commitOut" -ForegroundColor Red
        }

        Write-Host ""
    } else {
        $ts = Get-Date -Format "HH:mm:ss"
        Write-Host "[$ts] Sem mudancas." -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds $IntervalSeconds
}
