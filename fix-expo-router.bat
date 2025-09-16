@echo off
echo Correction de la configuration expo-router...
echo.

echo 1. Installation des dependances expo-router...
npx expo install expo-router

echo 2. Verification de la configuration...
npx expo doctor

echo 3. Prebuild pour corriger les plugins...
npx expo prebuild --clean

echo 4. Verification finale...
npx expo config --type public

echo.
echo Configuration expo-router corrigee!
echo Vous pouvez maintenant lancer: eas build -p ios --profile production
pause
