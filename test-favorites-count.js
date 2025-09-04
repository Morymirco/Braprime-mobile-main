// Script de test pour vérifier le comptage des favoris
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utiliser les mêmes clés que dans config.ts)
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFavoritesCount() {
  try {
    console.log('🧪 Test du comptage des favoris...\n');

    // Récupérer un utilisateur de test (remplacer par un vrai user_id)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé pour le test');
      return;
    }

    const testUserId = users[0].id;
    console.log(`👤 Utilisateur de test: ${testUserId}\n`);

    // 1. Compter les commerces favoris
    const { count: businessesCount, error: businessesError } = await supabase
      .from('favorite_businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', testUserId);

    if (businessesError) {
      console.error('❌ Erreur lors du comptage des commerces favoris:', businessesError);
    } else {
      console.log(`🏪 Commerces favoris: ${businessesCount || 0}`);
    }

    // 2. Compter les articles favoris
    const { count: menuItemsCount, error: menuItemsError } = await supabase
      .from('favorite_menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', testUserId);

    if (menuItemsError) {
      console.error('❌ Erreur lors du comptage des articles favoris:', menuItemsError);
    } else {
      console.log(`🍽️ Articles favoris: ${menuItemsCount || 0}`);
    }

    // 3. Total des favoris
    const totalFavorites = (businessesCount || 0) + (menuItemsCount || 0);
    console.log(`\n📊 Total des favoris: ${totalFavorites}`);

    // 4. Vérifier les données brutes
    console.log('\n🔍 Vérification des données brutes...');
    
    const { data: favoriteBusinesses, error: fbError } = await supabase
      .from('favorite_businesses')
      .select('*')
      .eq('user_id', testUserId);

    if (fbError) {
      console.error('❌ Erreur lors de la récupération des commerces favoris:', fbError);
    } else {
      console.log(`📋 Commerces favoris (données): ${favoriteBusinesses?.length || 0}`);
      if (favoriteBusinesses && favoriteBusinesses.length > 0) {
        favoriteBusinesses.forEach((fav, index) => {
          console.log(`  ${index + 1}. Business ID: ${fav.business_id}, Créé: ${fav.created_at}`);
        });
      }
    }

    const { data: favoriteMenuItems, error: fmError } = await supabase
      .from('favorite_menu_items')
      .select('*')
      .eq('user_id', testUserId);

    if (fmError) {
      console.error('❌ Erreur lors de la récupération des articles favoris:', fmError);
    } else {
      console.log(`📋 Articles favoris (données): ${favoriteMenuItems?.length || 0}`);
      if (favoriteMenuItems && favoriteMenuItems.length > 0) {
        favoriteMenuItems.forEach((fav, index) => {
          console.log(`  ${index + 1}. Menu Item ID: ${fav.menu_item_id}, Créé: ${fav.created_at}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testFavoritesCount();
