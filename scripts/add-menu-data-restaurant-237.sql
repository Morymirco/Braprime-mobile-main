-- Script SQL pour ajouter des catégories et articles de menu au restaurant ID 239
-- Images provenant d'Unsplash

-- 1. Ajouter les catégories de menu
INSERT INTO menu_categories (business_id, name, description, sort_order, is_active)
VALUES 
    (239, 'Entrées', 'Nos délicieuses entrées pour commencer votre repas', 1, true),
    (239, 'Plats Principaux', 'Nos spécialités culinaires principales', 2, true),
    (239, 'Boissons', 'Boissons chaudes et fraîches', 3, true),
    (239, 'Desserts', 'Nos douceurs pour terminer en beauté', 4, true);

-- 2. Récupérer les IDs des catégories créées
-- (Dans un vrai script, vous devriez utiliser les IDs retournés par les INSERT)

-- 3. Ajouter les articles de menu - ENTREES
INSERT INTO menu_items (business_id, category_id, name, description, price, image, is_available, is_popular, sort_order)
VALUES 
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Entrées' LIMIT 1), 
     'Salade César', 
     'Salade fraîche avec croûtons, parmesan et sauce césar maison', 
     8500, 
     'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80', 
     true, true, 1),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Entrées' LIMIT 1), 
     'Bruschetta Tomate', 
     'Pain grillé aux tomates fraîches, basilic et huile d''olive', 
     6500, 
     'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&q=80', 
     true, false, 2),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Entrées' LIMIT 1), 
     'Soupe du Jour', 
     'Soupe fraîche préparée selon les produits du jour', 
     5500, 
     'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', 
     true, false, 3);

-- 4. Ajouter les articles de menu - PLATS PRINCIPAUX
INSERT INTO menu_items (business_id, category_id, name, description, price, image, is_available, is_popular, sort_order)
VALUES 
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Plats Principaux' LIMIT 1), 
     'Poulet Rôti aux Herbes', 
     'Poulet entier rôti aux herbes de Provence, accompagné de légumes de saison', 
     18500, 
     'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&q=80', 
     true, true, 1),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Plats Principaux' LIMIT 1), 
     'Saumon Grillé', 
     'Filet de saumon grillé, riz pilaf et légumes verts', 
     22500, 
     'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80', 
     true, true, 2),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Plats Principaux' LIMIT 1), 
     'Pâtes Carbonara', 
     'Pâtes fraîches à la carbonara traditionnelle avec lardons et parmesan', 
     12500, 
     'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&q=80', 
     true, false, 3),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Plats Principaux' LIMIT 1), 
     'Steak Frites', 
     'Entrecôte grillée, frites maison et salade verte', 
     19500, 
     'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', 
     true, false, 4);

-- 5. Ajouter les articles de menu - BOISSONS
INSERT INTO menu_items (business_id, category_id, name, description, price, image, is_available, is_popular, sort_order)
VALUES 
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Boissons' LIMIT 1), 
     'Jus d''Orange Frais', 
     'Jus d''orange pressé fraîchement chaque matin', 
     3500, 
     'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80', 
     true, true, 1),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Boissons' LIMIT 1), 
     'Café Expresso', 
     'Café expresso italien torréfié artisanalement', 
     2500, 
     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', 
     true, false, 2),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Boissons' LIMIT 1), 
     'Thé à la Menthe', 
     'Thé vert à la menthe fraîche du jardin', 
     2000, 
     'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', 
     true, false, 3),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Boissons' LIMIT 1), 
     'Limonade Maison', 
     'Limonade fraîche préparée avec des citrons bio', 
     3000, 
     'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80', 
     true, false, 4);

-- 6. Ajouter les articles de menu - DESSERTS
INSERT INTO menu_items (business_id, category_id, name, description, price, image, is_available, is_popular, sort_order)
VALUES 
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Desserts' LIMIT 1), 
     'Tiramisu', 
     'Tiramisu traditionnel italien au café et mascarpone', 
     6500, 
     'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', 
     true, true, 1),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Desserts' LIMIT 1), 
     'Crème Brûlée', 
     'Crème brûlée à la vanille de Madagascar', 
     5500, 
     'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', 
     true, false, 2),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Desserts' LIMIT 1), 
     'Tarte aux Pommes', 
     'Tarte aux pommes caramélisées, pâte brisée maison', 
     4500, 
     'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&q=80', 
     true, false, 3),
     
    (239, (SELECT id FROM menu_categories WHERE business_id = 239 AND name = 'Desserts' LIMIT 1), 
     'Mousse au Chocolat', 
     'Mousse au chocolat noir 70% de cacao', 
     5000, 
     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', 
     true, false, 4);

-- 7. Vérification des données ajoutées
SELECT 
    mc.name as category_name,
    COUNT(mi.id) as item_count,
    AVG(mi.price) as average_price
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
WHERE mc.business_id = 239
GROUP BY mc.id, mc.name, mc.sort_order
ORDER BY mc.sort_order;

-- 8. Afficher tous les articles ajoutés
SELECT 
    mc.name as category,
    mi.name as item_name,
    mi.price,
    mi.is_popular,
    mi.image
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mc.business_id = 239
ORDER BY mc.sort_order, mi.sort_order;
