-- Script pour mettre à jour la table business_types avec le champ image_url
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter le champ image_url à la table business_types
ALTER TABLE business_types ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Mettre à jour les images pour chaque type de commerce
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80' WHERE name = 'restaurant';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80' WHERE name = 'cafe';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' WHERE name = 'market';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' WHERE name = 'supermarket';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80' WHERE name = 'pharmacy';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80' WHERE name = 'electronics';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80' WHERE name = 'beauty';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80' WHERE name = 'hairdressing';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80' WHERE name = 'hardware';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80' WHERE name = 'bookstore';
UPDATE business_types SET image_url = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80' WHERE name = 'document_service';

-- Vérifier les mises à jour
SELECT name, image_url FROM business_types ORDER BY name; 