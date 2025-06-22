const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de la base de données BraPrime');
console.log('='.repeat(50));

// Vérifier les problèmes courants
const commonIssues = [
  {
    name: 'Schéma non exécuté',
    description: 'Le schéma de base de données n\'a pas été exécuté',
    solution: 'Exécuter le fichier database/schema.sql dans Supabase SQL Editor'
  },
  {
    name: 'Trigger manquant',
    description: 'Le trigger handle_new_user n\'existe pas',
    solution: 'Vérifier que la fonction et le trigger sont créés'
  },
  {
    name: 'Table profiles manquante',
    description: 'La table profiles n\'existe pas',
    solution: 'Créer la table profiles avec les bonnes colonnes'
  },
  {
    name: 'Permissions RLS',
    description: 'Les politiques RLS bloquent l\'insertion',
    solution: 'Vérifier les politiques RLS sur la table profiles'
  }
];

console.log('📋 Problèmes courants et solutions :');
console.log('');

commonIssues.forEach((issue, index) => {
  console.log(`${index + 1}. ${issue.name}`);
  console.log(`   Description: ${issue.description}`);
  console.log(`   Solution: ${issue.solution}`);
  console.log('');
});

// Afficher le schéma SQL minimal pour corriger le problème
console.log('🔧 Script SQL minimal pour corriger le problème :');
console.log('='.repeat(50));

const minimalSchema = `
-- 1. Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    phone TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la fonction handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, phone, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'inscription
        RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Activer RLS et créer les politiques
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion automatique
CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre la lecture de son propre profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
`;

console.log(minimalSchema);

console.log('');
console.log('📋 Étapes à suivre :');
console.log('1. Allez sur https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/sql');
console.log('2. Copiez le script ci-dessus');
console.log('3. Collez-le dans l\'éditeur SQL');
console.log('4. Cliquez sur "Run"');
console.log('5. Testez à nouveau l\'inscription');
console.log('');

// Vérifier si le fichier schema.sql existe
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Le fichier database/schema.sql existe');
  console.log('💡 Vous pouvez aussi exécuter le schéma complet :');
  console.log('   node scripts/setup-database.js');
} else {
  console.log('❌ Le fichier database/schema.sql n\'existe pas');
}

console.log('');
console.log('🔍 Pour diagnostiquer plus précisément :');
console.log('1. Vérifiez les logs dans Supabase Dashboard > Logs');
console.log('2. Regardez les erreurs dans la console de l\'application');
console.log('3. Vérifiez que l\'authentification par téléphone est activée'); 