@echo off
title AyushCase - AYUSH Case-Taking Software
color 0A

echo ===================================================
echo     🌿 AyushCase - Ministry of Ayush SIH 2024
echo ===================================================
echo.

:: Add Node runtime to PATH
set "PATH=C:\Users\Mark\AppData\Local\OpenAI\Codex\runtimes\cua_node\950613ca46815e82\bin;%PATH%"

echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing npm packages...
    call npm install
)

echo [2/3] Setting up SQLite database (dev.db)...
call npx prisma db push
call node prisma/seed.js

echo.
echo [3/3] Starting AyushCase on http://localhost:3000 ...
echo.
echo ---------------------------------------------------
echo  Open your browser at: http://localhost:3000
echo  Demo Login: dr.sharma@ayushcase.in / Password123
echo ---------------------------------------------------
echo.

call npm run dev
pause
