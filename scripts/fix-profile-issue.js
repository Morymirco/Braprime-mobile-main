const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - remplacez par vos vraies valeurs
const supabaseUrl = 'VOTRE_URL_SUPABASE';
const supabaseAnonKey = 'VOTRE_CLE_ANONYME_SUPABASE';

if (supabaseUrl === 'VOTRE_URL_SUPABASE' || supabaseAnonKey === 'VOTRE_CLE_ANONYME_SUPABASE') {
  console.log('❌ Veuillez configurer vos clés Supabase dans le script');
  console.log('📝 Modifiez les variables supabaseUrl et supabaseAnonKey dans ce fichier');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseProfileIssue() {
  console.log('🔍 Diagnostic du problème de profil utilisateur\n');

  try {
    // 1. Vérifier les utilisateurs existants
    console.log('1️⃣ Vérification des utilisateurs existants...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }

    console.log(`✅ ${users.users.length} utilisateur(s) trouvé(s)`);
    
    if (users.users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé. Créez d\'abord un utilisateur via l\'application.');
      return;
    }

    // 2. Vérifier les profils existants
    console.log('\n2️⃣ Vérification des profils existants...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError.message);
      return;
    }

    console.log(`✅ ${profiles.length} profil(s) trouvé(s)`);

    // 3. Comparer utilisateurs et profils
    console.log('\n3️⃣ Comparaison utilisateurs/profils...');
    const userIds = users.users.map(user => user.id);
    const profileIds = profiles.map(profile => profile.id);
    
    const missingProfiles = userIds.filter(userId => !profileIds.includes(userId));
    const orphanedProfiles = profileIds.filter(profileId => !userIds.includes(profileId));

    if (missingProfiles.length > 0) {
      console.log(`⚠️  ${missingProfiles.length} utilisateur(s) sans profil:`);
      missingProfiles.forEach(userId => {
        const user = users.users.find(u => u.id === userId);
        console.log(`   - ${user?.email} (${userId})`);
      });
    }

    if (orphanedProfiles.length > 0) {
      console.log(`⚠️  ${orphanedProfiles.length} profil(s) orphelin(s):`);
      orphanedProfiles.forEach(profileId => {
        console.log(`   - ${profileId}`);
      });
    }

    if (missingProfiles.length === 0 && orphanedProfiles.length === 0) {
      console.log('✅ Tous les utilisateurs ont un profil correspondant');
    }

    // 4. Vérifier les triggers
    console.log('\n4️⃣ Vérification des triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers_info');

    if (triggersError) {
      console.log('⚠️  Impossible de vérifier les triggers directement');
      console.log('💡 Vérifiez manuellement dans Supabase Dashboard > Database > Functions');
    } else {
      console.log('✅ Triggers vérifiés');
    }

    return { missingProfiles, users: users.users, profiles };

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

async function createMissingProfiles(missingProfiles, users) {
  console.log('\n🔧 Création des profils manquants...');

  for (const userId of missingProfiles) {
    const user = users.find(u => u.id === userId);
    if (!user) continue;

    console.log(`📝 Création du profil pour ${user.email}...`);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          phone: user.phone,
          full_name: user.user_metadata?.full_name || '',
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
      } else {
        console.log(`✅ Profil créé pour ${user.email}`);
      }

      // Créer aussi le portefeuille
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0,
          currency: 'CFA'
        });

      if (walletError) {
        console.error(`❌ Erreur portefeuille pour ${user.email}:`, walletError.message);
      } else {
        console.log(`✅ Portefeuille créé pour ${user.email}`);
      }

    } catch (err) {
      console.error(`❌ Erreur inattendue pour ${user.email}:`, err.message);
    }
  }
}

async function testProfileAccess() {
  console.log('\n🧪 Test d\'accès au profil...');

  try {
    // Récupérer le premier utilisateur pour le test
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || users.users.length === 0) {
      console.log('⚠️  Aucun utilisateur disponible pour le test');
      return;
    }

    const testUser = users.users[0];
    console.log(`🔑 Test avec l'utilisateur: ${testUser.email}`);

    // Simuler une connexion avec cet utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur d\'accès au profil:', profileError.message);
    } else {
      console.log('✅ Accès au profil réussi:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function fixProfileIssue() {
  console.log('🚀 Correction du problème de profil utilisateur\n');

  try {
    // 1. Diagnostiquer le problème
    const diagnosis = await diagnoseProfileIssue();
    
    if (!diagnosis) {
      console.log('❌ Impossible de diagnostiquer le problème');
      return;
    }

    const { missingProfiles, users } = diagnosis;

    // 2. Créer les profils manquants
    if (missingProfiles.length > 0) {
      await createMissingProfiles(missingProfiles, users);
    } else {
      console.log('✅ Aucun profil manquant à créer');
    }

    // 3. Tester l'accès
    await testProfileAccess();

    console.log('\n🎉 Correction terminée !');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Exécuter la correction
fixProfileIssue().catch(console.error); 