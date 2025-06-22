const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://gehvdncxbcfotnabmjmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaHZkbmN4YmNmb3RuYWJtam1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDk5MDIsImV4cCI6MjA2NjEyNTkwMn0.vKsn8CZws3C2l-TNwmgzOIafbrI35EQNDmFHjHdW4i8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTrigger() {
  console.log('🔧 Création du trigger handle_new_user');
  console.log('='.repeat(50));

  try {
    // 1. Créer la fonction handle_new_user
    console.log('1. Création de la fonction handle_new_user...');
    
    const functionSQL = `
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
          
          -- Créer automatiquement un portefeuille
          INSERT INTO wallets (user_id, balance, currency)
          VALUES (NEW.id, 0, 'CFA');
          
          RETURN NEW;
      EXCEPTION
          WHEN OTHERS THEN
              -- Log l'erreur mais ne pas faire échouer l'inscription
              RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
              RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: functionSQL });
    
    if (functionError) {
      console.log('⚠️ Impossible de créer la fonction via RPC:', functionError.message);
      console.log('💡 Créez-la manuellement dans Supabase SQL Editor');
    } else {
      console.log('✅ Fonction handle_new_user créée');
    }

    // 2. Créer le trigger
    console.log('2. Création du trigger on_auth_user_created...');
    
    const triggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });
    
    if (triggerError) {
      console.log('⚠️ Impossible de créer le trigger via RPC:', triggerError.message);
      console.log('💡 Créez-le manuellement dans Supabase SQL Editor');
    } else {
      console.log('✅ Trigger on_auth_user_created créé');
    }

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }

  console.log('\n📋 Script SQL à exécuter manuellement :');
  console.log('='.repeat(50));
  
  const manualSQL = `
-- 1. Créer la fonction handle_new_user
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
    
    -- Créer automatiquement un portefeuille
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (NEW.id, 0, 'CFA');
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'inscription
        RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`;

  console.log(manualSQL);
  
  console.log('\n📋 Étapes à suivre :');
  console.log('1. Allez sur https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/sql');
  console.log('2. Copiez le script SQL ci-dessus');
  console.log('3. Collez-le dans l\'éditeur SQL');
  console.log('4. Cliquez sur "Run"');
  console.log('5. Testez à nouveau l\'inscription');
  console.log('');
  console.log('🔍 Vérifiez aussi que l\'authentification par téléphone est activée :');
  console.log('   https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/providers');
}

createTrigger().catch(console.error); 