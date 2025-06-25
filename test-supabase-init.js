const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://gehvdncxbcfotnabmjmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaHZkbmN4YmNmb3RuYWJtam1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDk5MDIsImV4cCI6MjA2NjEyNTkwMn0.vKsn8CZws3C2l-TNwmgzOIafbrI35EQNDmFHjHdW4i8';

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseInit() {
  console.log('🔍 Test de connexion Supabase avec le schéma init.sql...');
  console.log('URL:', supabaseUrl);
  console.log('Clé anonyme:', supabaseAnonKey.substring(0, 20) + '...');
  console.log('');

  try {
    // Test 1: Vérifier la connexion de base
    console.log('1️⃣ Test de connexion de base...');
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️  Erreur d\'authentification (normal si pas connecté):', authError.message);
    } else {
      console.log('✅ Connexion d\'authentification OK');
    }

    // Test 2: Vérifier les tables principales du schéma init.sql
    console.log('');
    console.log('2️⃣ Vérification des tables du schéma init.sql...');
    
    const initTables = [
      // Tables d'authentification et utilisateurs
      'user_roles', 'user_profiles',
      
      // Tables de géolocalisation
      'delivery_zones', 'user_addresses',
      
      // Tables des catégories et commerces
      'categories', 'business_types', 'businesses',
      
      // Tables des menus et articles
      'menu_categories', 'menu_items',
      
      // Tables des commandes
      'order_statuses', 'payment_methods', 'orders',
      
      // Tables des réservations
      'reservation_statuses', 'reservations',
      
      // Tables des livreurs
      'drivers',
      
      // Tables des avis et notes
      'reviews',
      
      // Tables des notifications
      'notification_types', 'notifications',
      
      // Tables des paiements
      'payments',
      
      // Tables de configuration
      'app_settings'
    ];
    
    let accessibleTables = [];
    let inaccessibleTables = [];

    for (const table of initTables) {
      try {
        // Essayer de faire un SELECT COUNT(*) sur chaque table
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table "${table}": ${error.message}`);
          inaccessibleTables.push(table);
        } else {
          console.log(`✅ Table "${table}": accessible`);
          accessibleTables.push(table);
        }
      } catch (err) {
        console.log(`❌ Table "${table}": erreur - ${err.message}`);
        inaccessibleTables.push(table);
      }
    }

    console.log('');
    console.log('📊 Résumé des tables:');
    console.log(`✅ Tables accessibles: ${accessibleTables.length}`);
    console.log(`❌ Tables inaccessibles: ${inaccessibleTables.length}`);
    
    if (accessibleTables.length > 0) {
      console.log('');
      console.log('✅ Tables accessibles:');
      accessibleTables.forEach(table => console.log(`   - ${table}`));
    }
    
    if (inaccessibleTables.length > 0) {
      console.log('');
      console.log('❌ Tables inaccessibles:');
      inaccessibleTables.forEach(table => console.log(`   - ${table}`));
    }

    // Test 3: Vérifier les données initiales
    console.log('');
    console.log('3️⃣ Vérification des données initiales...');
    
    const dataChecks = [
      { table: 'user_roles', description: 'Rôles utilisateur' },
      { table: 'order_statuses', description: 'Statuts de commande' },
      { table: 'payment_methods', description: 'Méthodes de paiement' },
      { table: 'categories', description: 'Catégories' },
      { table: 'business_types', description: 'Types de commerce' },
      { table: 'delivery_zones', description: 'Zones de livraison' }
    ];

    for (const check of dataChecks) {
      if (accessibleTables.includes(check.table)) {
        try {
          const { data, error } = await supabase
            .from(check.table)
            .select('*')
            .limit(5);
          
          if (error) {
            console.log(`❌ Données "${check.description}": ${error.message}`);
          } else {
            console.log(`✅ ${check.description}: ${data.length} enregistrements trouvés`);
          }
        } catch (err) {
          console.log(`❌ Erreur lors de la vérification des ${check.description}: ${err.message}`);
        }
      }
    }

    // Test 4: Vérifier les vues
    console.log('');
    console.log('4️⃣ Vérification des vues...');
    
    const views = ['business_stats', 'order_details'];
    
    for (const view of views) {
      try {
        const { data, error } = await supabase
          .from(view)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Vue "${view}": ${error.message}`);
        } else {
          console.log(`✅ Vue "${view}": accessible`);
        }
      } catch (err) {
        console.log(`❌ Vue "${view}": erreur - ${err.message}`);
      }
    }

    console.log('');
    console.log('🎉 Test de connexion terminé!');
    
    if (accessibleTables.length > 0) {
      console.log('✅ Les identifiants Supabase sont corrects!');
      console.log('✅ Le schéma init.sql semble être en place.');
      
      if (inaccessibleTables.length > 0) {
        console.log('');
        console.log('⚠️  Certaines tables ne sont pas encore créées.');
        console.log('💡 Exécutez le script init.sql dans l\'éditeur SQL de Supabase pour créer toutes les tables.');
      } else {
        console.log('🎉 Toutes les tables sont accessibles!');
      }
    } else {
      console.log('❌ Aucune table accessible.');
      console.log('💡 Vous devez exécuter le script init.sql dans votre projet Supabase.');
    }

  } catch (error) {
    console.log('❌ Erreur fatale:', error.message);
    console.log('❌ Les identifiants Supabase peuvent être incorrects.');
  }
}

// Exécuter le test
testSupabaseInit(); 