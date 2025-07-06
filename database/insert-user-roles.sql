-- Script pour insérer les rôles utilisateur manquants
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Vérifier si les rôles existent déjà
DO $$
BEGIN
    -- Insérer le rôle 'customer' s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'customer') THEN
        INSERT INTO user_roles (name, description) VALUES
        ('customer', 'Client - Peut passer des commandes et gérer son profil');
    END IF;

    -- Insérer le rôle 'partner' s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'partner') THEN
        INSERT INTO user_roles (name, description) VALUES
        ('partner', 'Partenaire - Gère un commerce et ses commandes');
    END IF;

    -- Insérer le rôle 'admin' s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'admin') THEN
        INSERT INTO user_roles (name, description) VALUES
        ('admin', 'Administrateur - Accès complet à la plateforme');
    END IF;

    -- Insérer le rôle 'driver' s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'driver') THEN
        INSERT INTO user_roles (name, description) VALUES
        ('driver', 'Livreur - Livre les commandes');
    END IF;
END $$;

-- Afficher les rôles insérés
SELECT id, name, description FROM user_roles ORDER BY id; 