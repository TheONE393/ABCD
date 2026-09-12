@echo off
title ABCD Lab - Photo & Data Sync to GitHub
echo ===================================================
echo   Syncing Lab Photos and Data to GitHub/Cloudflare
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking for changes in public\images and src\data...
git status --short public/images src/data

echo.
echo [2/3] Staging and committing changes...
git add public/ src/data/
git commit -m "Update lab photos and data via Explorer (%date% %time%)"

echo.
echo [3/3] Pushing to GitHub (origin main)...
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo  SUCCESS! Changes pushed to GitHub.
    echo  GitHub Pages / Cloudflare will now deploy the site.
    echo ===================================================
) else (
    echo [NOTE] Nothing new to push, or push encountered an error.
)

echo.
echo You may close this window.
timeout /t 5
