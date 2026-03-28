# StaySteward Migration Runner
# Runs a SQL migration file against your Supabase database
# Usage: .\migrate.ps1 supabase\migrations\005_leads_tables.sql

param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile
)

if (-not (Test-Path $SqlFile)) {
    Write-Host "File not found: $SqlFile" -ForegroundColor Red
    exit 1
}

# Check if Supabase CLI is installed
$hasCli = Get-Command npx -ErrorAction SilentlyContinue

Write-Host "`n=== Running Migration: $SqlFile ===" -ForegroundColor Cyan

# Option 1: Use Supabase CLI if linked
if ($env:SUPABASE_DB_URL) {
    Write-Host "Using direct database connection..." -ForegroundColor Green
    psql $env:SUPABASE_DB_URL -f $SqlFile
} else {
    # Option 2: Copy to clipboard for Supabase Dashboard
    $content = Get-Content $SqlFile -Raw
    $content | Set-Clipboard
    Write-Host "`nMigration SQL copied to clipboard!" -ForegroundColor Green
    Write-Host "`nPaste it in: Supabase Dashboard > SQL Editor > New Query > Run" -ForegroundColor Yellow
    Write-Host "Dashboard: https://supabase.com/dashboard" -ForegroundColor Gray

    # Offer to open browser
    $open = Read-Host "`nOpen Supabase Dashboard? (y/n)"
    if ($open -eq 'y') {
        Start-Process "https://supabase.com/dashboard"
    }
}

Write-Host "`n=== Done ===" -ForegroundColor Green
