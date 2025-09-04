// Configuration d'environnement pour BraPrime Mobile
export const ENV_CONFIG = {
  // Google Places API
  GOOGLE_PLACES_API_KEY: 'AIzaSyDIp_O6TQg33J4Z2M44Uj3SEJZfTq1EqZU',
  
  // Supabase (si nécessaire)
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Autres configurations
  APP_NAME: 'BraPrime Mobile',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
};
