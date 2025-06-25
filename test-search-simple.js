const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
  console.log('🧪 Test de recherche simple...\n');

  try {
    // Test 1: Recherche d'éléments de menu
    console.log('1️⃣ Test de recherche d\'éléments de menu...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        *,
        business:businesses(id, name, business_type_id, cover_image, logo)
      `)
      .eq('is_available', true)
      .or('name.ilike.%pizza%,description.ilike.%pizza%')
      .order('name')
      .limit(10);

    if (menuError) {
      console.error('❌ Erreur recherche menu:', menuError);
    } else {
      console.log(`✅ ${menuItems?.length || 0} éléments de menu trouvés`);
      menuItems?.forEach(item => {
        console.log(`   - ${item.name} (${item.business?.name || 'N/A'}) - ${item.price} GNF`);
      });
    }

    // Test 2: Recherche avec un terme plus général
    console.log('\n2️⃣ Test de recherche avec "café"...');
    const { data: cafeItems, error: cafeError } = await supabase
      .from('menu_items')
      .select(`
        *,
        business:businesses(id, name, business_type_id, cover_image, logo)
      `)
      .eq('is_available', true)
      .or('name.ilike.%café%,description.ilike.%café%')
      .order('name')
      .limit(5);

    if (cafeError) {
      console.error('❌ Erreur recherche café:', cafeError);
    } else {
      console.log(`✅ ${cafeItems?.length || 0} éléments trouvés pour "café"`);
      cafeItems?.forEach(item => {
        console.log(`   - ${item.name} (${item.business?.name || 'N/A'})`);
      });
    }

    // Test 3: Vérifier la structure des données
    console.log('\n3️⃣ Structure des données...');
    if (menuItems && menuItems.length > 0) {
      const firstItem = menuItems[0];
      console.log('Structure du premier élément:', {
        id: firstItem.id,
        name: firstItem.name,
        price: firstItem.price,
        business: firstItem.business ? {
          id: firstItem.business.id,
          name: firstItem.business.name
        } : null
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testSearch(); 