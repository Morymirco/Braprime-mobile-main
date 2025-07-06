# 🧹 GUIDE DE NETTOYAGE POUR LA PRODUCTION

## 📋 FICHIERS DE TEST À SUPPRIMER

### Scripts de test
- `test-google-maps-api.js`
- `test-google-maps-integration.js`
- `test-search-simple.js`
- `test-services-page.js`
- `test-supabase-connection.js`
- `test-supabase-init.js`
- `test-new-routes.js`
- `test-orders.js`
- `test-profile-data.js`
- `test-business-types.js`
- `test-existing-user.js`
- `test-global-search.js`
- `test-auth-logic.js`
- `test-business-navigation.js`

### Scripts de développement
- `cleanup-duplicates.js`
- `scripts/build-development.js`

### Documentation de développement
- `BUILD_DEVELOPMENT_GUIDE.md`
- `GOOGLE_MAPS_TEST_GUIDE.md`
- `TEST_GOOGLE_MAPS_SIMPLE.md`
- `TEST_GOOGLE_MAPS.md`
- `GOOGLE_MAPS_SETUP.md`
- `MAPS_SETUP_GUIDE.md`
- `GOOGLE_PLACES_GUIDE.md`
- `GOOGLE_PLACES_SETUP.md`
- `QUICK_START_GOOGLE_MAPS.md`
- `CARTE_SOLUTIONS.md`

### Fichiers de base de données de développement
- `fix-reservations-schema.sql`
- `update-business-types.sql`

## 🚀 COMMANDES DE NETTOYAGE

```bash
# Supprimer les fichiers de test
rm test-*.js
rm cleanup-duplicates.js
rm scripts/build-development.js

# Supprimer la documentation de développement
rm BUILD_DEVELOPMENT_GUIDE.md
rm GOOGLE_MAPS_TEST_GUIDE.md
rm TEST_GOOGLE_MAPS*.md
rm GOOGLE_MAPS_SETUP.md
rm MAPS_SETUP_GUIDE.md
rm GOOGLE_PLACES*.md
rm QUICK_START_GOOGLE_MAPS.md
rm CARTE_SOLUTIONS.md

# Supprimer les fichiers SQL de développement
rm fix-reservations-schema.sql
rm update-business-types.sql

# Nettoyer les dépendances de développement
npm prune --production

# Supprimer les dossiers de build
rm -rf dist/
rm -rf .expo/
rm -rf web-build/

# Nettoyer le cache
npx expo start --clear
```

## 📦 MISE À JOUR PACKAGE.JSON

Supprimer les scripts de développement :
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "expo lint"
  }
}
```

## 🔧 CONFIGURATION FINALE

1. **Vérifier app.json** - S'assurer que la configuration est correcte
2. **Tester l'application** - Vérifier que tout fonctionne après nettoyage
3. **Mettre à jour README.md** - Supprimer les références aux scripts de test
4. **Vérifier .gitignore** - S'assurer que les fichiers sensibles sont ignorés

## ✅ CHECKLIST DE VALIDATION

- [ ] Tous les fichiers de test supprimés
- [ ] Documentation de développement supprimée
- [ ] Scripts de développement supprimés
- [ ] package.json nettoyé
- [ ] Application testée et fonctionnelle
- [ ] README.md mis à jour
- [ ] .gitignore vérifié
- [ ] Build de production testé

## 🎯 RÉSULTAT FINAL

Après nettoyage, votre projet contiendra uniquement :
- Code source de l'application
- Configuration de production
- Documentation utilisateur
- Assets et ressources
- Configuration de build EAS 