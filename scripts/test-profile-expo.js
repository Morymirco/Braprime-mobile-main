const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - remplacez par vos vraies valeurs
const supabaseUrl = 'VOTRE_URL_SUPABASE';
const supabaseAnonKey = 'VOTRE_CLE_ANONYME_SUPABASE';

if (supabaseUrl === 'VOTRE_URL_SUPABASE' || supabaseAnonKey === 'VOTRE_CLE_ANONYME_SUPABASE') {
  console.log('❌ Veuillez configurer vos clés Supabase dans le script');
  console.log('📝 Modifiez les variables supabaseUrl et supabaseAnonKey dans ce fichier');
  console.log('🔗 Vous pouvez trouver ces valeurs dans votre dashboard Supabase > Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileOperations() {
  console.log('🧪 Test des opérations de profil utilisateur\n');

  try {
    // 1. Tester la récupération d'un profil existant
    console.log('1️⃣ Test de récupération de profil...');
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des profils:', fetchError.message);
      return;
    }

    if (profiles.length === 0) {
      console.log('⚠️  Aucun profil trouvé dans la base de données');
      console.log('💡 Créez d\'abord un utilisateur via l\'application');
      return;
    }

    const testProfile = profiles[0];
    console.log('✅ Profil récupéré:', {
      id: testProfile.id,
      full_name: testProfile.full_name,
      email: testProfile.email,
      phone: testProfile.phone
    });

    // 2. Tester la mise à jour du profil
    console.log('\n2️⃣ Test de mise à jour de profil...');
    const testUpdates = {
      full_name: `Test User ${Date.now()}`,
      phone: '+224123456789',
      updated_at: new Date().toISOString()
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(testUpdates)
      .eq('id', testProfile.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError.message);
      return;
    }

    console.log('✅ Profil mis à jour avec succès:', {
      id: updatedProfile.id,
      full_name: updatedProfile.full_name,
      phone: updatedProfile.phone,
      updated_at: updatedProfile.updated_at
    });

    // 3. Tester la récupération du profil mis à jour
    console.log('\n3️⃣ Test de récupération du profil mis à jour...');
    const { data: refreshedProfile, error: refreshError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testProfile.id)
      .single();

    if (refreshError) {
      console.error('❌ Erreur lors de la récupération:', refreshError.message);
      return;
    }

    console.log('✅ Profil rafraîchi:', {
      id: refreshedProfile.id,
      full_name: refreshedProfile.full_name,
      phone: refreshedProfile.phone,
      updated_at: refreshedProfile.updated_at
    });

    // 4. Vérifier la structure de la table
    console.log('\n4️⃣ Vérification de la structure de la table...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la structure:', tableError.message);
    } else {
      console.log('✅ Structure de la table profiles OK');
    }

    console.log('\n🎉 Tous les tests de profil sont terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

async function testUserCreation() {
  console.log('\n🧪 Test de création d\'utilisateur\n');

  try {
    // Créer un utilisateur de test
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testFullName = 'Utilisateur Test';

    console.log('1️⃣ Création d\'un utilisateur de test...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { full_name: testFullName }
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', authError.message);
      return;
    }

    console.log('✅ Utilisateur créé:', {
      id: authData.user?.id,
      email: authData.user?.email,
      full_name: authData.user?.user_metadata?.full_name
    });

    // Vérifier que le profil a été créé automatiquement
    if (authData.user) {
      console.log('\n2️⃣ Vérification de la création automatique du profil...');
      
      // Attendre un peu pour que le trigger s'exécute
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError.message);
      } else {
        console.log('✅ Profil créé automatiquement:', {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          created_at: profile.created_at
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests de profil utilisateur\n');
  
  await testProfileOperations();
  await testUserCreation();
  
  console.log('\n✨ Tests terminés !');
}

runTests().catch(console.error); 