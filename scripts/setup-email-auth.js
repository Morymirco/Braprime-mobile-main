console.log('🔧 Configuration de l\'authentification par email (Magic Link)');
console.log('='.repeat(60));

console.log('📧 AVANTAGES DE L\'AUTHENTIFICATION PAR EMAIL :');
console.log('✅ Pas besoin de service SMS externe (Twilio)');
console.log('✅ Configuration simple dans Supabase');
console.log('✅ Sécurisé avec des liens à usage unique');
console.log('✅ Fonctionne partout dans le monde');
console.log('✅ Pas de coûts supplémentaires');
console.log('');

console.log('🔧 CONFIGURATION DANS SUPABASE :');
console.log('');

console.log('1. 🎯 Activer l\'authentification par email :');
console.log('   a) Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/providers');
console.log('   b) Activez "Email Auth"');
console.log('   c) Configurez les paramètres :');
console.log('      - Enable email confirmations: ✅');
console.log('      - Enable email change confirmations: ✅');
console.log('      - Double confirm changes: ✅ (optionnel)');
console.log('');

console.log('2. 📧 Configurer les templates d\'email :');
console.log('   a) Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/templates');
console.log('   b) Personnalisez le template "Confirm signup" :');
console.log('      - Sujet : "Confirmez votre inscription - BraPrime"');
console.log('      - Contenu : Incluez le lien de confirmation');
console.log('');

console.log('3. 🔗 Configurer les redirections :');
console.log('   a) Allez sur : https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/url-configuration');
console.log('   b) Ajoutez les URLs de redirection :');
console.log('      - Site URL: https://braprime.com (ou votre domaine)');
console.log('      - Redirect URLs: braprime://login-callback');
console.log('');

console.log('📋 SCRIPT SQL POUR METTRE À JOUR LE SCHÉMA :');
console.log('='.repeat(50));

const updateSchema = `
-- Mettre à jour la table profiles pour privilégier l'email
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_phone_key;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Mettre à jour la fonction handle_new_user
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

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`;

console.log(updateSchema);

console.log('📋 ÉTAPES DÉTAILLÉES :');
console.log('');

console.log('Étape 1 : Configuration Supabase');
console.log('   - Activez Email Auth dans Auth > Providers');
console.log('   - Configurez les templates d\'email');
console.log('   - Ajoutez les URLs de redirection');
console.log('');

console.log('Étape 2 : Mise à jour du schéma');
console.log('   - Exécutez le script SQL ci-dessus');
console.log('   - Ou utilisez : node scripts/setup-database.js');
console.log('');

console.log('Étape 3 : Test de l\'application');
console.log('   - Lancez l\'application : npm start');
console.log('   - Testez avec une adresse email valide');
console.log('   - Vérifiez la réception du magic link');
console.log('');

console.log('🔍 VÉRIFICATIONS :');
console.log('✅ Email Auth activé dans Supabase');
console.log('✅ Templates d\'email configurés');
console.log('✅ URLs de redirection définies');
console.log('✅ Schéma de base de données mis à jour');
console.log('✅ Application modifiée pour l\'email');
console.log('');

console.log('📞 LIENS UTILES :');
console.log('- Supabase Auth Providers: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/providers');
console.log('- Supabase Auth Templates: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/templates');
console.log('- Supabase URL Configuration: https://supabase.com/dashboard/project/gehvdncxbcfotnabmjmo/auth/url-configuration');
console.log('- Documentation Magic Link: https://supabase.com/docs/guides/auth/auth-magic-link'); 