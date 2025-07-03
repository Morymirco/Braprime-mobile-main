-- Script pour corriger le schéma de la table reservations
-- Remplacer party_size par guests pour correspondre au schéma bd.sql

-- Vérifier si la colonne party_size existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'party_size'
    ) THEN
        -- Ajouter la colonne guests si elle n'existe pas
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'reservations' 
            AND column_name = 'guests'
        ) THEN
            ALTER TABLE reservations ADD COLUMN guests INTEGER NOT NULL DEFAULT 1;
        END IF;
        
        -- Copier les données de party_size vers guests
        UPDATE reservations SET guests = party_size WHERE guests IS NULL OR guests = 1;
        
        -- Supprimer la colonne party_size
        ALTER TABLE reservations DROP COLUMN party_size;
        
        RAISE NOTICE 'Colonne party_size remplacée par guests avec succès';
    ELSE
        RAISE NOTICE 'La colonne party_size n''existe pas, aucune action nécessaire';
    END IF;
END $$; 