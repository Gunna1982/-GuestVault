# StaySteward Deploy Script
# Usage: deploy "your commit message"
# Or just: deploy  (uses default message)
# Handles: migrations, commit, push, server sync — all in one

param(
    [string]$Message = "Update StaySteward"
)

$ErrorActionPreference = "Continue"
$project = "C:\Users\forev\dev\-GuestVault"

# Make sure we're in the right directory
Set-Location $project

Write-Host ""
Write-Host "  StaySteward Deploy" -ForegroundColor Yellow
Write-Host "  ==================" -ForegroundColor Yellow

# --- Step 1: Check for new migrations ---
Write-Host "`n[1/5] Checking for new migrations..." -ForegroundColor Cyan

$migrations = git diff --name-only HEAD -- "supabase/migrations/*.sql" 2>$null
$untrackedMigrations = git ls-files --others --exclude-standard -- "supabase/migrations/*.sql" 2>$null
$allNewMigrations = @()
if ($migrations) { $allNewMigrations += $migrations }
if ($untrackedMigrations) { $allNewMigrations += $untrackedMigrations }

if ($allNewMigrations.Count -gt 0) {
    Write-Host "  New migrations found:" -ForegroundColor Yellow
    foreach ($m in $allNewMigrations) {
        Write-Host "    - $m" -ForegroundColor Yellow
        $content = Get-Content $m -Raw
        $content | Set-Clipboard
        Write-Host "    Copied to clipboard! Paste in Supabase SQL Editor and run it." -ForegroundColor Green
        Write-Host "    Press ENTER after you've run it..." -ForegroundColor Gray -NoNewline
        Read-Host
    }
    Write-Host "  Migrations done." -ForegroundColor Green
} else {
    Write-Host "  No new migrations." -ForegroundColor Gray
}

# --- Step 2: Stage changes ---
Write-Host "`n[2/5] Staging changes..." -ForegroundColor Cyan
git add -A
$changes = git status --short
if (-not $changes) {
    Write-Host "  No changes to deploy." -ForegroundColor Yellow
    exit 0
}
Write-Host $changes

# --- Step 3: Commit ---
Write-Host "`n[3/5] Committing: $Message" -ForegroundColor Cyan
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Commit failed." -ForegroundColor Red
    exit 1
}

# --- Step 4: Push to GitHub (Vercel auto-deploys) ---
Write-Host "`n[4/5] Pushing to GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  Vercel auto-deploy triggered." -ForegroundColor Green

# --- Step 5: Sync dev server ---
Write-Host "`n[5/5] Syncing dev server..." -ForegroundColor Cyan
ssh deploy@StelliformDigitalDev "cd /var/www/guestvault && git pull origin main && echo 'Server synced.'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Server sync failed (non-critical)." -ForegroundColor Yellow
} else {
    Write-Host "  Server synced." -ForegroundColor Green
}

# --- Done ---
Write-Host ""
Write-Host "  Deploy Complete!" -ForegroundColor Green
Write-Host "  Vercel:  https://guest-vault.vercel.app" -ForegroundColor Gray
Write-Host "  Server:  StelliformDigitalDev:/var/www/guestvault" -ForegroundColor Gray
Write-Host ""
