@echo off
echo ========================================
echo RESET COMPLET DU PROJET BRAPRIME
echo ========================================
echo.

echo 1. Sauvegarde des fichiers importants...
if not exist backup mkdir backup
copy app.json backup\app.json
copy eas.json backup\eas.json
copy package.json backup\package.json
copy .npmrc backup\.npmrc

echo 2. Suppression complete des caches et dependances...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock
if exist .expo rmdir /s /q .expo
if exist .metro-cache rmdir /s /q .metro-cache
if exist .yarnrc del .yarnrc
if exist .yarnrc.yml del .yarnrc.yml

echo 3. Nettoyage des caches npm...
npm cache clean --force

echo 4. Installation propre avec npm...
npm install --legacy-peer-deps --no-package-lock

echo 5. Generation du package-lock.json...
npm install --legacy-peer-deps

echo 6. Verification de la configuration...
npx expo doctor

echo.
echo ========================================
echo RESET TERMINE !
echo ========================================
echo.
echo Vous pouvez maintenant essayer:
echo - eas build -p ios --profile production
echo - eas build -p android --profile production
echo.
pause
