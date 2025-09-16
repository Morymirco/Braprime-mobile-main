@echo off
echo Optimisation du build BraPrime Mobile pour eviter les timeouts...
echo.

echo 1. Nettoyage des caches...
npm cache clean --force
if exist .expo rmdir /s /q .expo
if exist .metro-cache rmdir /s /q .metro-cache
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 2. Prebuild pour optimiser les fichiers natifs...
npx expo prebuild --clean --platform android
npx expo prebuild --clean --platform ios

echo 3. Installation des dependances optimisees...
npm run install:fast

echo 4. Verification de la configuration...
npx expo doctor

echo.
echo Configuration terminee! Utilisez maintenant:
echo - npm run build:fast     (pour un build optimise)
echo - npm run build:android  (pour Android uniquement)
echo - npm run build:ios      (pour iOS uniquement)
echo.
pause
