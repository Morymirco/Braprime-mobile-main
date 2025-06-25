const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGlobalSearch() {
  console.log('🧪 Test de la recherche globale...\n');

  try {
    // Test 1: Recherche de commerces
    console.log('1️⃣ Test de recherche de commerces...');
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select(`
        *,
        business_type:business_types(id, name, icon, color, image_url),
        category:categories(id, name, icon, color)
      `)
      .eq('is_active', true)
      .or('name.ilike.%restaurant%,description.ilike.%restaurant%')
      .order('name');

    if (businessError) {
      console.error('❌ Erreur recherche commerces:', businessError);
    } else {
      console.log(`✅ ${businesses?.length || 0} commerces trouvés`);
      businesses?.forEach(b => console.log(`   - ${b.name} (${b.business_type?.name})`));
    }

    // Test 2: Recherche d'éléments de menu
    console.log('\n2️⃣ Test de recherche d\'éléments de menu...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        *,
        business:businesses(id, name, business_type_id, cover_image, logo)
      `)
      .eq('is_available', true)
      .or('name.ilike.%pizza%,description.ilike.%pizza%')
      .order('name');

    if (menuError) {
      console.error('❌ Erreur recherche menu:', menuError);
    } else {
      console.log(`✅ ${menuItems?.length || 0} éléments de menu trouvés`);
      menuItems?.forEach(item => console.log(`   - ${item.name} (${item.business?.name}) - ${item.price} GNF`));
    }

    // Test 3: Vérifier les tables existantes
    console.log('\n3️⃣ Vérification des tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['businesses', 'menu_items', 'business_types', 'categories']);

    if (tablesError) {
      console.error('❌ Erreur vérification tables:', tablesError);
    } else {
      console.log('✅ Tables trouvées:', tables?.map(t => t.table_name).join(', '));
    }

    // Test 4: Vérifier les relations
    console.log('\n4️⃣ Test des relations...');
    const { data: businessWithMenu, error: relationError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        menu_items(id, name, price)
      `)
      .eq('is_active', true)
      .limit(3);

    if (relationError) {
      console.error('❌ Erreur relations:', relationError);
    } else {
      console.log('✅ Relations testées avec succès');
      businessWithMenu?.forEach(b => {
        console.log(`   - ${b.name}: ${b.menu_items?.length || 0} éléments de menu`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testGlobalSearch(); 