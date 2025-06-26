const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBusinessNavigation() {
  console.log('🔍 Test de navigation des businesses...');
  
  try {
    // 1. Récupérer un type de commerce
    const { data: businessTypes, error: typesError } = await supabase
      .from('business_types')
      .select('*')
      .limit(1);
    
    if (typesError) {
      console.error('❌ Erreur lors de la récupération des types:', typesError);
      return;
    }
    
    if (!businessTypes || businessTypes.length === 0) {
      console.log('❌ Aucun type de commerce trouvé');
      return;
    }
    
    const testType = businessTypes[0];
    console.log('📊 Type de commerce test:', testType.name, '(ID:', testType.id, ')');
    
    // 2. Récupérer les businesses de ce type
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select(`
        *,
        business_type:business_types(id, name, icon, color, image_url)
      `)
      .eq('business_type_id', testType.id)
      .eq('is_active', true)
      .limit(3);
    
    if (businessesError) {
      console.error('❌ Erreur lors de la récupération des businesses:', businessesError);
      return;
    }
    
    console.log('📊 Businesses trouvés:', businesses?.length || 0);
    
    if (businesses && businesses.length > 0) {
      businesses.forEach((business, index) => {
        console.log(`  Business ${index + 1}:`, {
          id: business.id,
          idType: typeof business.id,
          name: business.name,
          businessType: business.business_type?.name,
          businessTypeId: business.business_type_id
        });
        
        // 3. Tester la récupération individuelle de ce business
        testIndividualBusiness(business.id);
      });
    } else {
      console.log('❌ Aucun business trouvé pour ce type');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

async function testIndividualBusiness(businessId) {
  try {
    console.log(`\n🔍 Test de récupération du business ID: ${businessId}`);
    
    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        *,
        business_type:business_types(id, name, icon, color, image_url)
      `)
      .eq('id', businessId)
      .single();
    
    if (error) {
      console.error(`❌ Erreur lors de la récupération du business ${businessId}:`, error);
      return;
    }
    
    if (business) {
      console.log(`✅ Business ${businessId} récupéré avec succès:`, {
        id: business.id,
        name: business.name,
        businessType: business.business_type?.name
      });
    } else {
      console.log(`❌ Business ${businessId} non trouvé`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors du test du business ${businessId}:`, error);
  }
}

testBusinessNavigation(); 