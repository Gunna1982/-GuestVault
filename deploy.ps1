# StaySteward Deploy Script
# Usage: .\deploy.ps1 "commit message here"
# Or just: .\deploy.ps1  (uses default message)

param(
    [string]$Message = "Update StaySteward"
)

Write-Host "`n=== StaySteward Deploy ===" -ForegroundColor Amber

# 1. Stage all changes
Write-Host "`n[1/4] Staging changes..." -ForegroundColor Cyan
git add -A
git status --short

# 2. Commit
Write-Host "`n[2/4] Committing: $Message" -ForegroundColor Cyan
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow
    exit 1
}

# 3. Push to GitHub (triggers Vercel auto-deploy)
Write-Host "`n[3/4] Pushing to GitHub (Vercel auto-deploys)..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed!" -ForegroundColor Red
    exit 1
}

# 4. Sync dev server
Write-Host "`n[4/4] Syncing dev server..." -ForegroundColor Cyan
ssh deploy@StelliformDigitalDev "cd /var/www/guestvault && git pull origin main"

Write-Host "`n=== Deploy Complete ===" -ForegroundColor Green
Write-Host "Vercel: https://guest-vault.vercel.app" -ForegroundColor Gray
Write-Host "Server: StelliformDigitalDev:/var/www/guestvault" -ForegroundColor Gray
