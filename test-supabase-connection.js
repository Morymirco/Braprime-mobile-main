const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec les clés du fichier config.ts
const supabaseUrl = 'https://gehvdncxbcfotnabmjmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaHZkbmN4YmNmb3RuYWJtam1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDk5MDIsImV4cCI6MjA2NjEyNTkwMn0.vKsn8CZws3C2l-TNwmgzOIafbrI35EQNDmFHjHdW4i8';

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Clé anonyme:', supabaseAnonKey.substring(0, 20) + '...');
  console.log('');

  try {
    // Test 1: Vérifier la connexion de base
    console.log('1️⃣ Test de connexion de base...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion réussie!');
    console.log('');

    // Test 2: Lister les tables disponibles
    console.log('2️⃣ Test de récupération des données...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Erreur lors de la récupération des profils:', profilesError.message);
    } else {
      console.log('✅ Récupération des profils réussie');
      console.log(`📊 Nombre de profils récupérés: ${profiles.length}`);
    }

    // Test 3: Vérifier les tables principales
    console.log('');
    console.log('3️⃣ Test des tables principales...');
    
    const tables = ['profiles', 'categories', 'stores', 'products', 'orders', 'wallets'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table "${table}": ${error.message}`);
        } else {
          console.log(`✅ Table "${table}": accessible`);
        }
      } catch (err) {
        console.log(`❌ Table "${table}": erreur - ${err.message}`);
      }
    }

    console.log('');
    console.log('🎉 Test de connexion terminé avec succès!');
    return true;

  } catch (error) {
    console.log('❌ Erreur fatale:', error.message);
    return false;
  }
}

// Exécuter le test
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log('✅ Les identifiants Supabase sont corrects!');
    } else {
      console.log('❌ Problème avec les identifiants Supabase');
    }
  })
  .catch((error) => {
    console.log('❌ Erreur lors du test:', error.message);
  }); 