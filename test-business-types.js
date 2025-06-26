const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock BusinessService class for testing
class BusinessService {
  static async getBusinessesByTypeName(typeName) {
    try {
      console.log('🔍 getBusinessesByTypeName - Searching for type:', typeName);
      
      // First, get the business type ID by name
      const { data: businessType, error: typeError } = await supabase
        .from('business_types')
        .select('id')
        .eq('name', typeName)
        .single();

      if (typeError) {
        console.error('Erreur lors de la récupération du type de commerce:', typeError);
        throw typeError;
      }

      if (!businessType) {
        console.log('❌ Type de commerce non trouvé:', typeName);
        return [];
      }

      console.log('🔍 Found business type ID:', businessType.id);

      // Then get businesses by the type ID
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_type:business_types(id, name, icon, color, image_url),
          category:categories(id, name, icon, color)
        `)
        .eq('business_type_id', businessType.id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des commerces par nom de type:', error);
        throw error;
      }

      console.log('🔍 getBusinessesByTypeName - Found businesses:', data?.length || 0);
      if (data) {
        data.forEach((business, index) => {
          console.log(`  Business ${index + 1}:`, {
            id: business.id,
            idType: typeof business.id,
            name: business.name,
            businessType: business.business_type?.name
          });
        });
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getBusinessesByTypeName:', error);
      throw error;
    }
  }
}

async function testBusinessTypes() {
  console.log('🔍 Test des types de commerces...');
  
  try {
    // 1. Récupérer tous les types de commerces
    const { data: businessTypes, error: typesError } = await supabase
      .from('business_types')
      .select('*')
      .order('name');
    
    if (typesError) {
      console.error('❌ Erreur lors de la récupération des types:', typesError);
      return;
    }
    
    console.log('📊 Types de commerces disponibles:', businessTypes?.length || 0);
    businessTypes?.forEach(type => {
      console.log(`  - ${type.name} (ID: ${type.id})`);
    });
    
    // 2. Récupérer quelques commerces pour tester
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        business_type_id,
        business_type:business_types(id, name)
      `)
      .eq('is_active', true)
      .limit(5);
    
    if (businessesError) {
      console.error('❌ Erreur lors de la récupération des commerces:', businessesError);
      return;
    }
    
    console.log('\n📊 Commerces disponibles:', businesses?.length || 0);
    businesses?.forEach(business => {
      console.log(`  - ${business.name} (ID: ${business.id}, Type: ${business.business_type?.name})`);
    });
    
    // 3. Tester la recherche par nom de type avec BusinessService
    if (businessTypes && businessTypes.length > 0) {
      const testType = businessTypes[0].name;
      console.log(`\n🔍 Test de recherche pour le type: ${testType}`);
      
      const testBusinesses = await BusinessService.getBusinessesByTypeName(testType);
      console.log(`✅ Trouvé ${testBusinesses?.length || 0} commerces pour le type "${testType}"`);
      testBusinesses?.forEach(business => {
        console.log(`  - ${business.name} (ID: ${business.id}, Type: ${business.business_type?.name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testBusinessTypes(); 