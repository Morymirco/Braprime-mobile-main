-- =====================================================
-- CORRECTION DU TRIGGER DE CRÉATION DE PROFIL
-- =====================================================

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer l'ancienne fonction s'il existe
DROP FUNCTION IF EXISTS handle_new_user();

-- Recréer la fonction avec une meilleure gestion d'erreurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si le profil existe déjà
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
        -- Créer le profil
        INSERT INTO profiles (id, email, phone, full_name, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            NEW.phone,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            NEW.created_at,
            NEW.created_at
        );
        
        -- Créer automatiquement un portefeuille
        INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
        VALUES (NEW.id, 0, 'CFA', NEW.created_at, NEW.created_at);
        
        RAISE NOTICE 'Profil et portefeuille créés pour l''utilisateur: %', NEW.email;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'inscription
        RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- CRÉATION MANUELLE DES PROFILS MANQUANTS
-- =====================================================

-- Cette requête crée les profils pour les utilisateurs existants qui n'en ont pas
INSERT INTO profiles (id, email, phone, full_name, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    u.phone,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    u.created_at,
    u.created_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Créer les portefeuilles manquants
INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
SELECT 
    p.id,
    0,
    'CFA',
    p.created_at,
    p.created_at
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM wallets w WHERE w.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que tous les utilisateurs ont un profil
SELECT 
    'Utilisateurs sans profil' as check_type,
    COUNT(*) as count
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
)

UNION ALL

-- Vérifier que tous les profils ont un portefeuille
SELECT 
    'Profils sans portefeuille' as check_type,
    COUNT(*) as count
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM wallets w WHERE w.user_id = p.id
);

-- Afficher les utilisateurs et leurs profils
SELECT 
    u.email,
    u.id as user_id,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile,
    CASE WHEN w.user_id IS NOT NULL THEN '✅' ELSE '❌' END as has_wallet,
    p.full_name,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN wallets w ON u.id = w.user_id
ORDER BY u.created_at DESC; 