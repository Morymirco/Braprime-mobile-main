-- =====================================================
-- SCHÉMA POUR LES MENUS ET PRODUITS
-- =====================================================

-- =====================================================
-- TABLE CATÉGORIES DE MENU
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE PRODUITS/MENU ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    category TEXT NOT NULL,
    preparation_time TEXT,
    allergens TEXT[],
    nutritional_info JSONB,
    popularity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE OPTIONS DE PRODUIT (pour les personnalisations)
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_item_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    max_selections INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE CHOIX D'OPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_item_option_choices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    option_id UUID REFERENCES menu_item_options(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE AVIS SUR LES PRODUITS
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_item_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les menu_items
CREATE INDEX IF NOT EXISTS idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_popularity ON menu_items(popularity DESC);

-- Index pour les menu_categories
CREATE INDEX IF NOT EXISTS idx_menu_categories_business_id ON menu_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active);

-- Index pour les options
CREATE INDEX IF NOT EXISTS idx_menu_item_options_menu_item_id ON menu_item_options(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_option_choices_option_id ON menu_item_option_choices(option_id);

-- Index pour les avis
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_menu_item_id ON menu_item_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_user_id ON menu_item_reviews(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour updated_at sur menu_items
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_option_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_reviews ENABLE ROW LEVEL SECURITY;

-- Politiques pour menu_categories (lecture publique)
CREATE POLICY "Anyone can view active menu categories" ON menu_categories
    FOR SELECT USING (is_active = true);

-- Politiques pour menu_items (lecture publique)
CREATE POLICY "Anyone can view available menu items" ON menu_items
    FOR SELECT USING (is_available = true);

-- Politiques pour menu_item_options (lecture publique)
CREATE POLICY "Anyone can view active menu item options" ON menu_item_options
    FOR SELECT USING (is_active = true);

-- Politiques pour menu_item_option_choices (lecture publique)
CREATE POLICY "Anyone can view available menu item option choices" ON menu_item_option_choices
    FOR SELECT USING (is_available = true);

-- Politiques pour menu_item_reviews
CREATE POLICY "Anyone can view menu item reviews" ON menu_item_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON menu_item_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON menu_item_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON menu_item_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insérer des catégories de menu pour un commerce de test
INSERT INTO menu_categories (business_id, name, description, sort_order) VALUES
-- Note: Remplacer 'business-id-here' par un vrai ID de commerce
-- ('business-id-here', 'Entrées', 'Plats d''entrée et apéritifs', 1),
-- ('business-id-here', 'Plats principaux', 'Plats principaux et spécialités', 2),
-- ('business-id-here', 'Desserts', 'Desserts et pâtisseries', 3),
-- ('business-id-here', 'Boissons', 'Boissons et rafraîchissements', 4)
ON CONFLICT DO NOTHING;

-- Insérer des produits de test
INSERT INTO menu_items (business_id, name, description, price, category, preparation_time) VALUES
-- Note: Remplacer 'business-id-here' par un vrai ID de commerce
-- ('business-id-here', 'Pizza Margherita', 'Sauce tomate, mozzarella, basilic frais', 15000, 'Pizzas', '20-25 min'),
-- ('business-id-here', 'Pizza Quatre Fromages', 'Mozzarella, gorgonzola, parmesan, ricotta', 18000, 'Pizzas', '20-25 min'),
-- ('business-id-here', 'Salade César', 'Laitue, parmesan, croûtons, sauce césar', 8000, 'Salades', '10-15 min'),
-- ('business-id-here', 'Tiramisu', 'Dessert italien classique', 5000, 'Desserts', '5 min'),
-- ('business-id-here', 'Coca-Cola', 'Boisson gazeuse 33cl', 1500, 'Boissons', '2 min')
ON CONFLICT DO NOTHING; 