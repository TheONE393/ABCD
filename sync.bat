@echo off
title ABCD Lab - Google Sheet, Photo & Site Sync to GitHub
echo ===================================================
echo   Syncing Google Sheets, Photos & Site to GitHub
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/4] Fetching latest live data from Google Sheets...
call node scripts/fetch-sheet-data.mjs
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Could not fetch Google Sheets directly, proceeding with local files...
)

echo.
echo [2/4] Staging changes...
git add -A

echo.
echo [3/4] Committing changes...
git diff-index --quiet HEAD --
if %ERRORLEVEL% NEQ 0 (
    git commit -m "Sync latest Google Sheet data and media (%date% %time%)"
) else (
    echo [INFO] No local file diffs detected. Triggering GitHub rebuild for latest Sheet updates...
    git commit --allow-empty -m "Trigger rebuild with latest Google Sheet data (%date% %time%)"
)

echo.
echo [4/4] Pushing to GitHub (origin main)...
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo  SUCCESS! Changes pushed to GitHub.
    echo  GitHub Actions will now build and deploy the site.
    echo  Your live website will be updated in 1-2 minutes!
    echo ===================================================
) else (
    echo [ERROR] Push encountered an error. Please check your internet connection or git credentials.
)

echo.
echo You may close this window.
timeout /t 5
