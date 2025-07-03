-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_image TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_business_id ON reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservations_updated_at 
  BEFORE UPDATE ON reservations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres réservations
CREATE POLICY "Users can view their own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres réservations
CREATE POLICY "Users can create their own reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres réservations
CREATE POLICY "Users can update their own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux restaurants de voir les réservations de leur établissement
CREATE POLICY "Businesses can view their reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = reservations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Politique pour permettre aux restaurants de mettre à jour les réservations de leur établissement
CREATE POLICY "Businesses can update their reservations" ON reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = reservations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Fonction pour obtenir les statistiques de réservations
CREATE OR REPLACE FUNCTION get_reservation_stats(user_id_param UUID)
RETURNS TABLE (
  total_reservations BIGINT,
  pending_reservations BIGINT,
  confirmed_reservations BIGINT,
  cancelled_reservations BIGINT,
  completed_reservations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_reservations,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reservations,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_reservations,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_reservations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_reservations
  FROM reservations
  WHERE reservations.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les réservations à venir
CREATE OR REPLACE FUNCTION get_upcoming_reservations(user_id_param UUID, days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  business_image TEXT,
  date DATE,
  time TIME,
  party_size INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.business_name,
    r.business_image,
    r.date,
    r.time,
    r.party_size,
    r.status
  FROM reservations r
  WHERE r.user_id = user_id_param
    AND r.date >= CURRENT_DATE
    AND r.date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND r.status IN ('pending', 'confirmed')
  ORDER BY r.date ASC, r.time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 