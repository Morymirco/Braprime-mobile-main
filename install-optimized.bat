@echo off
echo Optimisation de l'installation des dependances BraPrime Mobile...
echo.

echo 1. Nettoyage du cache npm...
npm cache clean --force

echo 2. Suppression des anciens fichiers...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 3. Configuration npm optimisee...
npm config set prefer-offline true
npm config set audit false
npm config set fund false
npm config set engine-strict false

echo 4. Installation des dependances...
npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund

echo 5. Post-installation Expo...
npx expo install --fix

echo.
echo Installation terminee avec succes!
echo.
pause
