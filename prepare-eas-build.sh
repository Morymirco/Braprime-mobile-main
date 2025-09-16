#!/bin/bash
# Script de préparation pour EAS Build

echo "Préparation du build EAS..."

# Nettoyer les caches
echo "Nettoyage des caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .metro-cache

# Supprimer yarn.lock s'il existe
if [ -f "yarn.lock" ]; then
    echo "Suppression de yarn.lock..."
    rm yarn.lock
fi

# S'assurer que package-lock.json existe
if [ ! -f "package-lock.json" ]; then
    echo "Création de package-lock.json..."
    npm install --package-lock-only --legacy-peer-deps
fi

# Vérifier la configuration
echo "Vérification de la configuration..."
npx expo doctor

echo "Préparation terminée!"
