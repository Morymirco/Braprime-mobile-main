-- Schéma pour le système de panier

-- Table des paniers
CREATE TABLE IF NOT EXISTS cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  delivery_method TEXT DEFAULT 'delivery' CHECK (delivery_method IN ('delivery', 'pickup')),
  delivery_address TEXT,
  delivery_instructions TEXT,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table des articles du panier
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  image TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_business_id ON cart(business_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_menu_item_id ON cart_items(menu_item_id);

-- Vue pour les détails du panier avec calculs
CREATE OR REPLACE VIEW cart_details AS
SELECT 
  c.id as cart_id,
  c.user_id,
  c.business_id,
  c.business_name,
  c.delivery_method,
  c.delivery_address,
  c.delivery_instructions,
  c.delivery_fee,
  c.created_at,
  c.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ci.id,
        'cart_id', ci.cart_id,
        'menu_item_id', ci.menu_item_id,
        'name', ci.name,
        'price', ci.price,
        'quantity', ci.quantity,
        'image', ci.image,
        'special_instructions', ci.special_instructions,
        'created_at', ci.created_at,
        'updated_at', ci.updated_at
      ) ORDER BY ci.created_at
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'::json
  ) as items,
  COALESCE(SUM(ci.price * ci.quantity), 0) as total,
  COALESCE(SUM(ci.quantity), 0) as item_count
FROM cart c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
GROUP BY c.id, c.user_id, c.business_id, c.business_name, c.delivery_method, c.delivery_address, c.delivery_instructions, c.delivery_fee, c.created_at, c.updated_at;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_cart_updated_at 
  BEFORE UPDATE ON cart 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour nettoyer les paniers vides
CREATE OR REPLACE FUNCTION cleanup_empty_carts()
RETURNS void AS $$
BEGIN
  DELETE FROM cart 
  WHERE id NOT IN (
    SELECT DISTINCT cart_id 
    FROM cart_items 
    WHERE cart_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Politique RLS pour cart
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart" ON cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart" ON cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart" ON cart
  FOR DELETE USING (auth.uid() = user_id);

-- Politique RLS pour cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to their own cart" ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

-- Commentaires pour la documentation
COMMENT ON TABLE cart IS 'Table des paniers d''achat des utilisateurs';
COMMENT ON TABLE cart_items IS 'Table des articles dans les paniers';
COMMENT ON VIEW cart_details IS 'Vue des détails du panier avec calculs automatiques';
COMMENT ON FUNCTION cleanup_empty_carts() IS 'Fonction pour nettoyer les paniers vides'; 