@echo off
echo Build iOS BraPrime avec npm force...
echo.

echo 1. Nettoyage complet...
if exist .expo rmdir /s /q .expo
if exist .metro-cache rmdir /s /q .metro-cache
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

echo 2. Installation avec npm uniquement...
npm install --legacy-peer-deps --no-package-lock
npm install --legacy-peer-deps

echo 3. Verification...
npx expo doctor

echo 4. Build EAS...
eas build -p ios --profile production --clear-cache

echo.
echo Build termine!
pause
