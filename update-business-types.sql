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

-- Ajouter des éléments de menu de test pour la recherche globale
INSERT INTO menu_items (name, description, price, image, business_id, is_available) VALUES
('Pizza Margherita', 'Pizza traditionnelle avec sauce tomate, mozzarella et basilic', 25000, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80', 1, true),
('Burger Classique', 'Burger avec steak, salade, tomate et fromage', 18000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', 1, true),
('Salade César', 'Salade fraîche avec poulet grillé et vinaigrette césar', 12000, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80', 1, true),
('Café Expresso', 'Café expresso italien authentique', 3000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', 2, true),
('Cappuccino', 'Cappuccino crémeux avec mousse de lait', 4000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', 2, true),
('Croissant', 'Croissant beurré frais du jour', 2500, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', 2, true),
('Paracétamol 500mg', 'Antidouleur et antipyrétique', 5000, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', 3, true),
('Vitamine C', 'Complément alimentaire vitamine C', 8000, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80', 3, true),
('Smartphone Samsung', 'Smartphone Android dernière génération', 850000, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', 4, true),
('Écouteurs Bluetooth', 'Écouteurs sans fil haute qualité', 45000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', 4, true),
('Crème hydratante', 'Crème hydratante pour le visage', 15000, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', 5, true),
('Rouge à lèvres', 'Rouge à lèvres longue tenue', 12000, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80', 5, true)
ON CONFLICT (id) DO NOTHING; 