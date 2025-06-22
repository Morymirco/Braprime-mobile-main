const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://gehvdncxbcfotnabmjmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaHZkbmN4YmNmb3RuYWJtam1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDk5MDIsImV4cCI6MjA2NjEyNTkwMn0.vKsn8CZws3C2l-TNwmgzOIafbrI35EQNDmFHjHdW4i8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseConfig() {
  console.log('🔍 Vérification de la configuration Supabase');
  console.log('='.repeat(50));

  try {
    // 1. Vérifier la connexion
    console.log('1. Test de connexion...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('💡 La table profiles n\'existe pas. Exécutez le schéma SQL.');
        console.log('   Allez sur: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/sql');
        console.log('   Exécutez: node scripts/fix-database.js');
      }
    } else {
      console.log('✅ Connexion réussie');
    }

    // 2. Vérifier les tables
    console.log('\n2. Vérification des tables...');
    const tables = ['profiles', 'categories', 'stores', 'products', 'orders', 'wallets'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: Erreur - ${err.message}`);
      }
    }

    // 3. Vérifier les triggers
    console.log('\n3. Vérification des triggers...');
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_triggers')
      .select('*');
    
    if (triggerError) {
      console.log('⚠️ Impossible de vérifier les triggers:', triggerError.message);
      console.log('💡 Vérifiez manuellement dans Supabase Dashboard > Database > Functions');
    } else {
      console.log('✅ Triggers vérifiés');
    }

    // 4. Vérifier les politiques RLS
    console.log('\n4. Vérification des politiques RLS...');
    const { data: policies, error: policyError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (policyError && policyError.message.includes('new row violates row-level security policy')) {
      console.log('❌ Problème avec les politiques RLS sur profiles');
      console.log('💡 Exécutez le script de correction: node scripts/fix-database.js');
    } else if (policyError) {
      console.log('⚠️ Erreur lors de la vérification RLS:', policyError.message);
    } else {
      console.log('✅ Politiques RLS OK');
    }

  } catch (err) {
    console.error('❌ Erreur générale:', err.message);
  }

  console.log('\n📋 Recommandations :');
  console.log('1. Vérifiez que l\'authentification par téléphone est activée');
  console.log('   Allez sur: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/providers');
  console.log('');
  console.log('2. Exécutez le schéma de base de données');
  console.log('   node scripts/fix-database.js');
  console.log('');
  console.log('3. Vérifiez les logs dans Supabase Dashboard > Logs');
  console.log('');
  console.log('4. Testez avec un numéro de téléphone valide (+224XXXXXXXXX)');
}

checkSupabaseConfig().catch(console.error); 