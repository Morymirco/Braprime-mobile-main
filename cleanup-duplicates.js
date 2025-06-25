const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupDuplicates() {
  console.log('🧹 Nettoyage des doublons dans la base de données');
  console.log('================================================');
  console.log('');

  try {
    // 1. Vérifier les utilisateurs dans auth.users
    console.log('1️⃣ Vérification des utilisateurs auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Erreur récupération utilisateurs auth:', authError.message);
    } else {
      console.log(`✅ ${authUsers.users.length} utilisateurs trouvés dans auth.users`);
      
      // Afficher les emails des utilisateurs auth
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }
    console.log('');

    // 2. Vérifier les profils dans user_profiles
    console.log('2️⃣ Vérification des profils utilisateur...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (profilesError) {
      console.log('❌ Erreur récupération profils:', profilesError.message);
      return;
    }

    console.log(`✅ ${profiles.length} profils trouvés dans user_profiles`);
    
    // Afficher les profils
    profiles.forEach(profile => {
      console.log(`   - ${profile.email} (ID: ${profile.id}, Créé: ${profile.created_at})`);
    });
    console.log('');

    // 3. Identifier les doublons par email
    console.log('3️⃣ Identification des doublons...');
    const emailCounts = {};
    const duplicates = [];

    profiles.forEach(profile => {
      if (emailCounts[profile.email]) {
        emailCounts[profile.email]++;
        duplicates.push(profile);
      } else {
        emailCounts[profile.email] = 1;
      }
    });

    const duplicateEmails = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
    
    if (duplicateEmails.length === 0) {
      console.log('✅ Aucun doublon trouvé');
    } else {
      console.log(`⚠️  ${duplicateEmails.length} emails en doublon trouvés:`);
      duplicateEmails.forEach(email => {
        console.log(`   - ${email}: ${emailCounts[email]} occurrences`);
      });
    }
    console.log('');

    // 4. Nettoyer les doublons
    if (duplicateEmails.length > 0) {
      console.log('4️⃣ Nettoyage des doublons...');
      
      for (const email of duplicateEmails) {
        console.log(`🔧 Traitement de l'email: ${email}`);
        
        // Récupérer tous les profils pour cet email
        const { data: emailProfiles, error: emailError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .order('created_at', { ascending: true });

        if (emailError) {
          console.log(`❌ Erreur récupération profils pour ${email}:`, emailError.message);
          continue;
        }

        if (emailProfiles.length <= 1) {
          console.log(`✅ Aucun doublon pour ${email}`);
          continue;
        }

        console.log(`📋 ${emailProfiles.length} profils trouvés pour ${email}`);
        
        // Garder le premier profil (le plus ancien) et supprimer les autres
        const [keepProfile, ...duplicateProfiles] = emailProfiles;
        
        console.log(`💾 Garder le profil: ${keepProfile.id} (créé: ${keepProfile.created_at})`);
        
        for (const duplicateProfile of duplicateProfiles) {
          console.log(`🗑️  Suppression du profil: ${duplicateProfile.id}`);
          
          const { error: deleteError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', duplicateProfile.id);

          if (deleteError) {
            console.log(`❌ Erreur suppression profil ${duplicateProfile.id}:`, deleteError.message);
          } else {
            console.log(`✅ Profil ${duplicateProfile.id} supprimé`);
          }
        }
      }
    }

    // 5. Vérification finale
    console.log('');
    console.log('5️⃣ Vérification finale...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (finalError) {
      console.log('❌ Erreur vérification finale:', finalError.message);
    } else {
      console.log(`✅ ${finalProfiles.length} profils après nettoyage`);
      
      // Vérifier qu'il n'y a plus de doublons
      const finalEmailCounts = {};
      finalProfiles.forEach(profile => {
        finalEmailCounts[profile.email] = (finalEmailCounts[profile.email] || 0) + 1;
      });

      const remainingDuplicates = Object.keys(finalEmailCounts).filter(email => finalEmailCounts[email] > 1);
      
      if (remainingDuplicates.length === 0) {
        console.log('🎉 Aucun doublon restant - Nettoyage réussi!');
      } else {
        console.log(`⚠️  ${remainingDuplicates.length} doublons restants:`, remainingDuplicates);
      }
    }

    console.log('');
    console.log('✅ Nettoyage terminé!');
    console.log('💡 Vous pouvez maintenant tester la connexion dans l\'application.');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage
cleanupDuplicates().catch(console.error); 