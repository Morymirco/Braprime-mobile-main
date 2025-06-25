-- ============================================================================
-- SCRIPT SQL POUR INITIALISATION DE LA BASE DE DONNÉES BRAPRIME
-- ============================================================================
-- Ce script crée toutes les tables nécessaires pour la plateforme BraPrime
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES D'AUTHENTIFICATION ET UTILISATEURS
-- ============================================================================

-- Table des rôles utilisateur
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INTEGER REFERENCES user_roles(id) DEFAULT 1,
    phone_number VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DE GÉOLOCALISATION
-- ============================================================================

-- Table des zones de livraison
CREATE TABLE IF NOT EXISTS delivery_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    delivery_fee INTEGER NOT NULL DEFAULT 5000,
    delivery_time VARCHAR(50) NOT NULL DEFAULT '30-45 min',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des adresses utilisateur
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    label VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Guinée',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES CATÉGORIES ET COMMERCES
-- ============================================================================

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    link VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des types de commerce
CREATE TABLE IF NOT EXISTS business_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commerces
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    business_type_id INTEGER REFERENCES business_types(id),
    category_id INTEGER REFERENCES categories(id),
    cover_image VARCHAR(500),
    logo VARCHAR(500),
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    delivery_time VARCHAR(50) DEFAULT '30-45 min',
    delivery_fee INTEGER DEFAULT 5000,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    opening_hours VARCHAR(100),
    cuisine_type VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    is_open BOOLEAN DEFAULT true,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES MENUS ET ARTICLES
-- ============================================================================

-- Table des catégories de menu
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de menu
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image VARCHAR(500),
    category_id INTEGER REFERENCES menu_categories(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    is_popular BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    allergens JSONB DEFAULT '[]',
    nutritional_info JSONB DEFAULT '{}',
    preparation_time INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES COMMANDES
-- ============================================================================

-- Table des statuts de commande
CREATE TABLE IF NOT EXISTS order_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des méthodes de paiement
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    business_id INTEGER REFERENCES businesses(id),
    business_name VARCHAR(200) NOT NULL,
    items JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total INTEGER NOT NULL,
    delivery_fee INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    grand_total INTEGER NOT NULL,
    delivery_method VARCHAR(20) DEFAULT 'delivery',
    delivery_address TEXT,
    delivery_instructions TEXT,
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'pending',
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    driver_id UUID,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_location JSONB,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES RÉSERVATIONS
-- ============================================================================

-- Table des statuts de réservation
CREATE TABLE IF NOT EXISTS reservation_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    business_id INTEGER REFERENCES businesses(id),
    business_name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    special_requests TEXT,
    table_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES LIVREURS
-- ============================================================================

-- Table des livreurs
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    current_location JSONB,
    current_order_id UUID,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES AVIS ET NOTES
-- ============================================================================

-- Table des avis
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name VARCHAR(100) NOT NULL,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    order_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES NOTIFICATIONS
-- ============================================================================

-- Table des types de notification
CREATE TABLE IF NOT EXISTS notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DES PAIEMENTS
-- ============================================================================

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID,
    amount INTEGER NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLES DE CONFIGURATION
-- ============================================================================

-- Table des paramètres de l'application
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEX POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les recherches de commerces
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(business_type_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active, is_open);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- Index pour les adresses utilisateur
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- Index pour les commandes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);

-- Index pour les réservations
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- Index pour les avis
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Index pour les livreurs
CREATE INDEX IF NOT EXISTS idx_drivers_current_order ON drivers(current_order_id);

-- Index pour les paiements
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- ============================================================================
-- DONNÉES INITIALES
-- ============================================================================

-- Insérer les rôles utilisateur
INSERT INTO user_roles (name, description) VALUES
('customer', 'Client - Peut passer des commandes et gérer son profil'),
('partner', 'Partenaire - Gère un commerce et ses commandes'),
('admin', 'Administrateur - Accès complet à la plateforme'),
('driver', 'Livreur - Livre les commandes');

-- Insérer les statuts de commande
INSERT INTO order_statuses (name, label, color, icon, description, sort_order) VALUES
('pending', 'En attente', 'text-yellow-600', 'Clock', 'Votre commande est en attente de confirmation', 1),
('confirmed', 'Confirmée', 'text-blue-600', 'CheckCircle', 'Votre commande a été confirmée', 2),
('preparing', 'En préparation', 'text-orange-600', 'ChefHat', 'Votre commande est en cours de préparation', 3),
('ready', 'Prête', 'text-green-600', 'Package', 'Votre commande est prête pour la livraison', 4),
('picked_up', 'En livraison', 'text-purple-600', 'Truck', 'Votre commande est en cours de livraison', 5),
('delivered', 'Livrée', 'text-green-700', 'Home', 'Votre commande a été livrée', 6),
('cancelled', 'Annulée', 'text-red-600', 'XCircle', 'Votre commande a été annulée', 7);

-- Insérer les méthodes de paiement
INSERT INTO payment_methods (name, icon, description, is_available) VALUES
('cash', 'Banknote', 'Paiement en espèces à la livraison', true),
('card', 'CreditCard', 'Paiement par carte bancaire', false),
('mobile_money', 'Smartphone', 'Paiement par Mobile Money', false),
('bank_transfer', 'Building2', 'Virement bancaire', false);

-- Insérer les statuts de réservation
INSERT INTO reservation_statuses (name, label, color) VALUES
('pending', 'En attente', 'text-yellow-600'),
('confirmed', 'Confirmée', 'text-green-600'),
('cancelled', 'Annulée', 'text-red-600'),
('completed', 'Terminée', 'text-blue-600');

-- Insérer les types de notification
INSERT INTO notification_types (name, title, icon, color) VALUES
('order_status', 'Mise à jour de commande', 'Package', 'text-blue-600'),
('delivery_update', 'Mise à jour de livraison', 'Truck', 'text-green-600'),
('promotion', 'Offre spéciale', 'Gift', 'text-purple-600'),
('system', 'Notification système', 'Bell', 'text-gray-600'),
('payment', 'Paiement', 'CreditCard', 'text-orange-600');

-- Insérer les types de commerce
INSERT INTO business_types (name, icon, color, image_url, description, features) VALUES
('restaurant', 'Utensils', 'bg-guinea-red', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80', 'Découvrez les meilleurs restaurants de Guinée', '["Livraison rapide", "Menus variés", "Qualité garantie"]'),
('cafe', 'Coffee', 'bg-guinea-yellow', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80', 'Cafés et pâtisseries de qualité', '["Café frais", "Pâtisseries", "Ambiance conviviale"]'),
('market', 'ShoppingBasket', 'bg-guinea-green', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', 'Produits frais des marchés locaux', '["Produits frais", "Prix compétitifs", "Produits locaux"]'),
('supermarket', 'ShoppingCart', 'bg-blue-500', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', 'Supermarchés et hypermarchés', '["Large sélection", "Produits importés", "Qualité premium"]'),
('pharmacy', 'Pill', 'bg-green-500', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80', 'Médicaments et produits de santé', '["Médicaments", "Produits de santé", "Conseils pharmaceutiques"]'),
('electronics', 'Tv', 'bg-indigo-500', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', 'Équipements électroniques et informatiques', '["Équipements neufs", "Garantie", "Service technique"]'),
('beauty', 'Sparkles', 'bg-pink-400', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80', 'Produits de beauté et cosmétiques', '["Cosmétiques", "Soins", "Parfums"]'),
('hairdressing', 'Scissors', 'bg-slate-500', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80', 'Salons de coiffure et instituts de beauté', '["Coiffures", "Soins", "Rendez-vous"]'),
('hardware', 'Hammer', 'bg-zinc-600', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80', 'Outils et matériaux de construction', '["Outils", "Matériaux", "Conseils"]'),
('bookstore', 'BookOpen', 'bg-amber-500', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80', 'Livres et fournitures scolaires', '["Livres", "Fournitures", "Cadeaux"]'),
('document_service', 'FileText', 'bg-sky-500', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80', 'Services administratifs et documents', '["Photocopies", "Impression", "Services administratifs"]');

-- Insérer les catégories
INSERT INTO categories (name, icon, color, link, description) VALUES
('Restaurants', 'Utensils', 'bg-guinea-red', '/restaurants', 'Découvrez les meilleurs restaurants de Guinée'),
('Cafés', 'Coffee', 'bg-guinea-yellow', '/cafes', 'Cafés et pâtisseries de qualité'),
('Marchés', 'ShoppingBasket', 'bg-guinea-green', '/markets', 'Produits frais des marchés locaux'),
('Supermarchés', 'ShoppingCart', 'bg-blue-500', '/supermarkets', 'Supermarchés et hypermarchés'),
('Colis', 'Package', 'bg-purple-500', '/packages', 'Services de colis et livraison'),
('Cadeaux', 'Gift', 'bg-pink-500', '/gifts', 'Cadeaux et articles de fête'),
('Pharmacie', 'Pill', 'bg-green-500', '/pharmacy', 'Médicaments et produits de santé'),
('Électronique', 'Tv', 'bg-indigo-500', '/electronic-stores', 'Équipements électroniques'),
('Fournitures', 'Briefcase', 'bg-amber-500', '/supplies', 'Fournitures de bureau'),
('Documents', 'FileText', 'bg-sky-500', '/documents', 'Services de documents'),
('Beauté', 'Sparkles', 'bg-pink-400', '/beauty', 'Produits de beauté'),
('Bricolage', 'Hammer', 'bg-zinc-600', '/hardware', 'Outils et matériaux'),
('Coiffure', 'Scissors', 'bg-slate-500', '/hairdressing', 'Salons de coiffure');

-- Insérer les zones de livraison
INSERT INTO delivery_zones (name, delivery_fee, delivery_time) VALUES
('Kaloum', 3000, '15-25 min'),
('Dixinn', 4000, '20-30 min'),
('Ratoma', 5000, '25-35 min'),
('Matam', 6000, '30-40 min'),
('Matoto', 7000, '35-45 min'),
('Coyah', 10000, '45-60 min'),
('Dubréka', 12000, '50-70 min');

-- Insérer les paramètres de l'application
INSERT INTO app_settings (key, value, description) VALUES
('delivery_config', '{"max_distance": 50, "default_fee": 5000, "free_threshold": 50000, "tax_rate": 0.18}', 'Configuration de la livraison'),
('payment_config', '{"methods": ["cash"], "gateway": "stripe"}', 'Configuration des paiements'),
('notification_config', '{"display_duration": 5000, "max_displayed": 5}', 'Configuration des notifications'),
('business_config', '{"max_rating": 5, "min_reviews": 1}', 'Configuration des commerces');

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour businesses (lecture publique)
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (is_active = true);

-- Politiques pour orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour reviews
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VUES UTILES
-- ============================================================================

-- Supprimer les vues existantes si elles existent
DROP VIEW IF EXISTS business_stats;
DROP VIEW IF EXISTS order_details;

-- Vue pour les statistiques des commerces
CREATE VIEW business_stats AS
SELECT 
    b.id,
    b.name,
    b.business_type_id,
    bt.name as business_type,
    b.rating,
    b.review_count,
    COUNT(o.id) as total_orders,
    AVG(o.grand_total) as avg_order_value,
    SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as completed_orders
FROM businesses b
LEFT JOIN business_types bt ON b.business_type_id = bt.id
LEFT JOIN orders o ON b.id = o.business_id
WHERE b.is_active = true
GROUP BY b.id, b.name, b.business_type_id, bt.name, b.rating, b.review_count;

-- Vue pour les commandes avec détails
CREATE VIEW order_details AS
SELECT 
    o.*,
    up.name as customer_name,
    up.email as customer_email,
    up.phone_number as customer_phone,
    b.name as business_display_name,
    b.address as business_address,
    b.phone as business_phone
FROM orders o
LEFT JOIN user_profiles up ON o.user_id = up.id
LEFT JOIN businesses b ON o.business_id = b.id;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Script d''initialisation BraPrime exécuté avec succès!';
    RAISE NOTICE 'Tables créées: user_profiles, businesses, orders, reservations, etc.';
    RAISE NOTICE 'Données initiales insérées: rôles, statuts, catégories, etc.';
    RAISE NOTICE 'Index et politiques de sécurité configurés.';
END $$; 