# AyushCase PowerShell Launcher with Auto-PATH
$nodePath = "C:\Users\Mark\AppData\Local\OpenAI\Codex\runtimes\cua_node\950613ca46815e82\bin"
$env:PATH = "$nodePath;$env:PATH"

Write-Host "===================================================" -ForegroundColor Green
Write-Host "    🌿 AyushCase - Ministry of Ayush SIH 2026" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] Checking Node.js & npm..." -ForegroundColor Cyan
node -v
npm -v

Write-Host ""
Write-Host "[2/3] Setting up SQLite database & Seed Data..." -ForegroundColor Cyan
npx prisma db push
node prisma/seed.js

Write-Host ""
Write-Host "[3/3] Starting development server at http://localhost:3000 ..." -ForegroundColor Cyan
Write-Host "👉 Open http://localhost:3000 in your browser" -ForegroundColor Yellow
Write-Host "👉 Demo Login: dr.sharma@ayushcase.in / Password123" -ForegroundColor Yellow
Write-Host ""

npm run dev
