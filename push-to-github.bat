@echo off
title Push AyushCase to GitHub
color 0B

echo ===================================================
echo     🚀 Pushing AyushCase to GitHub Repository
echo ===================================================
echo.

cd /d "C:\Users\Mark\Desktop\sih-project"

echo Adding files...
git add .
git commit -m "update: AyushCase clinical case-taking app" 2>nul

echo Pushing to origin main...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo  🎉 SUCCESS! Project uploaded to GitHub!
    echo  Check: https://github.com/gurvin35-sudo/SIH-project-
    echo ===================================================
) else (
    echo ⚠️ Push failed or cancelled. Please check your GitHub login.
)

echo.
pause
