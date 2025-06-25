const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileData() {
  console.log('🔍 Test de récupération des données de profil...\n');

  try {
    // 1. Vérifier la structure de la table user_profiles
    console.log('📋 1. Structure de la table user_profiles:');
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError);
      return;
    }

    console.log('✅ Table user_profiles accessible');
    console.log('📊 Colonnes disponibles:', Object.keys(tableInfo[0] || {}));
    console.log('');

    // 2. Lister tous les profils existants
    console.log('👥 2. Profils utilisateurs existants:');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
      return;
    }

    if (profiles.length === 0) {
      console.log('⚠️  Aucun profil utilisateur trouvé');
      console.log('💡 Créez un utilisateur via Supabase Auth d\'abord');
    } else {
      console.log(`✅ ${profiles.length} profil(s) trouvé(s):`);
      profiles.forEach((profile, index) => {
        console.log(`\n👤 Profil ${index + 1}:`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Nom: ${profile.name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Rôle ID: ${profile.role_id}`);
        console.log(`   Téléphone: ${profile.phone_number || 'Non défini'}`);
        console.log(`   Adresse: ${profile.address || 'Non définie'}`);
        console.log(`   Image: ${profile.profile_image || 'Non définie'}`);
        console.log(`   Actif: ${profile.is_active}`);
        console.log(`   Créé le: ${new Date(profile.created_at).toLocaleString('fr-FR')}`);
      });
    }

    console.log('');

    // 3. Vérifier les rôles utilisateur
    console.log('🎭 3. Rôles utilisateur disponibles:');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('id');

    if (rolesError) {
      console.error('❌ Erreur lors de la récupération des rôles:', rolesError);
    } else {
      console.log('✅ Rôles disponibles:');
      roles.forEach(role => {
        console.log(`   ID ${role.id}: ${role.name} - ${role.description}`);
      });
    }

    console.log('');

    // 4. Test de récupération d'un profil spécifique (si des profils existent)
    if (profiles.length > 0) {
      const testProfile = profiles[0];
      console.log('🧪 4. Test de récupération d\'un profil spécifique:');
      console.log(`   Test avec l'ID: ${testProfile.id}`);

      const { data: singleProfile, error: singleError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testProfile.id)
        .single();

      if (singleError) {
        console.error('❌ Erreur lors de la récupération du profil:', singleError);
      } else {
        console.log('✅ Profil récupéré avec succès:');
        console.log(`   Nom: ${singleProfile.name}`);
        console.log(`   Email: ${singleProfile.email}`);
        console.log(`   Rôle: ${singleProfile.role_id === 2 ? 'Partenaire' : 'Client'}`);
      }
    }

    console.log('\n🎉 Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testProfileData(); 