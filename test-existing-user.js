const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExistingUser() {
  console.log('🧪 Test de connexion avec utilisateur existant');
  console.log('==============================================');
  console.log('');

  // Utiliser un email existant de la base de données
  const testEmail = 'morykoulibaly2023@gmail.com';
  const testPassword = 'password123'; // Vous devrez utiliser le vrai mot de passe

  console.log('📧 Email de test:', testEmail);
  console.log('🔑 Mot de passe:', testPassword ? '***' : 'vide');
  console.log('');

  try {
    // 1. Vérifier si l'utilisateur existe dans auth.users
    console.log('1️⃣ Vérification de l\'existence dans auth.users...');
    
    // On ne peut pas lister les utilisateurs avec la clé anonyme, 
    // mais on peut essayer de se connecter
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.log('❌ Erreur de connexion auth:', authError.message);
      console.log('💡 L\'utilisateur n\'existe pas dans auth.users ou le mot de passe est incorrect');
      return;
    }

    if (!authData.user) {
      console.log('❌ Aucun utilisateur retourné par Supabase Auth');
      return;
    }

    console.log('✅ Connexion auth réussie!');
    console.log('   - ID utilisateur:', authData.user.id);
    console.log('   - Email:', authData.user.email);
    console.log('   - Métadonnées:', authData.user.user_metadata);
    console.log('');

    // 2. Vérifier le profil dans user_profiles
    console.log('2️⃣ Vérification du profil dans user_profiles...');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        name,
        email,
        phone_number,
        address,
        profile_image,
        role_id,
        created_at
      `)
      .eq('email', testEmail)
      .single();

    if (profileError) {
      console.log('❌ Erreur récupération profil:', profileError.message);
      console.log('💡 Le profil n\'existe pas dans user_profiles');
      return;
    }

    if (!profile) {
      console.log('❌ Profil non trouvé dans user_profiles');
      return;
    }

    console.log('✅ Profil trouvé dans user_profiles!');
    console.log('   - ID profil:', profile.id);
    console.log('   - Nom:', profile.name);
    console.log('   - Email:', profile.email);
    console.log('   - Rôle ID:', profile.role_id);
    console.log('   - Créé le:', profile.created_at);
    console.log('');

    // 3. Vérifier la correspondance des IDs
    console.log('3️⃣ Vérification de la correspondance des IDs...');
    
    if (authData.user.id === profile.id) {
      console.log('✅ Les IDs correspondent parfaitement!');
    } else {
      console.log('⚠️  Les IDs ne correspondent pas:');
      console.log('   - ID auth.users:', authData.user.id);
      console.log('   - ID user_profiles:', profile.id);
      console.log('💡 Cela peut causer des problèmes de connexion');
    }
    console.log('');

    // 4. Test de mise à jour du profil
    console.log('4️⃣ Test de mise à jour du profil...');
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        name: profile.name, // Pas de changement, juste un test
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erreur mise à jour profil:', updateError.message);
    } else {
      console.log('✅ Mise à jour du profil réussie');
    }
    console.log('');

    // 5. Test de déconnexion
    console.log('5️⃣ Test de déconnexion...');
    
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.log('❌ Erreur de déconnexion:', logoutError.message);
    } else {
      console.log('✅ Déconnexion réussie');
    }
    console.log('');

    console.log('🎉 Test terminé avec succès!');
    console.log('💡 L\'utilisateur existe et peut se connecter normalement.');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

// Exécuter le test
testExistingUser().catch(console.error); 