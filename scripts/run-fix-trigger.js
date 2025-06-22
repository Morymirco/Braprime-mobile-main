const fs = require('fs');
const path = require('path');

console.log('🔧 Script de correction du trigger de profil utilisateur\n');

console.log('📝 Instructions pour corriger le problème :\n');

console.log('1️⃣ Allez sur votre dashboard Supabase :');
console.log('   https://supabase.com/dashboard\n');

console.log('2️⃣ Sélectionnez votre projet\n');

console.log('3️⃣ Allez dans "SQL Editor"\n');

console.log('4️⃣ Copiez le contenu du fichier scripts/fix-trigger.sql\n');

console.log('5️⃣ Collez-le dans l\'éditeur SQL et cliquez sur "Run"\n');

console.log('6️⃣ Vérifiez que les requêtes de vérification montrent 0 utilisateurs sans profil\n');

console.log('\n💡 Ce script va :');
console.log('   - Corriger le trigger de création automatique de profil');
console.log('   - Créer les profils manquants pour les utilisateurs existants');
console.log('   - Créer les portefeuilles manquants');
console.log('   - Vérifier que tout fonctionne correctement\n');

console.log('🚀 Après avoir exécuté le script SQL, redémarrez votre application\n');

// Afficher le contenu du script SQL
const sqlPath = path.join(__dirname, 'fix-trigger.sql');
if (fs.existsSync(sqlPath)) {
  console.log('📄 Contenu du script SQL :\n');
  console.log('='.repeat(50));
  console.log(fs.readFileSync(sqlPath, 'utf8'));
  console.log('='.repeat(50));
} else {
  console.log('❌ Fichier fix-trigger.sql non trouvé');
} 