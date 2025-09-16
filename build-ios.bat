@echo off
echo Build iOS BraPrime avec npm...
echo.

echo 1. Nettoyage des caches...
if exist .expo rmdir /s /q .expo
if exist .metro-cache rmdir /s /q .metro-cache
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 2. Suppression des fichiers yarn...
if exist yarn.lock del yarn.lock
if exist .yarnrc del .yarnrc

echo 3. Verification du package-lock.json...
if not exist package-lock.json (
    echo Creation du package-lock.json...
    npm install --package-lock-only --legacy-peer-deps
)

echo 4. Lancement du build EAS...
eas build -p ios --profile production --clear-cache

echo.
echo Build termine!
pause
