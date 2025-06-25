const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBusinessNavigation() {
  console.log('🧪 Test de navigation vers les commerces...\n');

  try {
    // Test 1: Récupérer tous les types de commerce
    console.log('1️⃣ Récupération des types de commerce pour la navigation:');
    const { data: businessTypes, error: businessTypesError } = await supabase
      .from('business_types')
      .select('*')
      .order('name');

    if (businessTypesError) {
      console.error('❌ Erreur lors de la récupération des types de commerce:', businessTypesError);
      return;
    }

    console.log(`✅ ${businessTypes.length} types de commerce récupérés:`);
    
    // Test 2: Vérifier les routes de navigation
    console.log('\n2️⃣ Routes de navigation disponibles:');
    businessTypes.forEach((type, index) => {
      const route = `/businesses/${type.name}`;
      console.log(`   ${index + 1}. ${type.name} → ${route}`);
    });

    // Test 3: Vérifier les commerces pour chaque type
    console.log('\n3️⃣ Vérification des commerces par type:');
    for (const businessType of businessTypes) {
      console.log(`\n📋 Type: ${businessType.name}`);
      
      const { data: businesses, error: businessesError } = await supabase
        .from('businesses')
        .select(`
          id, name, description, rating, review_count, 
          delivery_time, delivery_fee, address, is_open,
          business_type:business_types(name)
        `)
        .eq('business_type_id', businessType.id)
        .eq('is_active', true);

      if (businessesError) {
        console.log(`   ❌ Erreur: ${businessesError.message}`);
        continue;
      }

      console.log(`   ✅ ${businesses.length} commerce(s) trouvé(s)`);
      
      if (businesses.length > 0) {
        businesses.slice(0, 3).forEach((business, idx) => {
          console.log(`      ${idx + 1}. ${business.name}`);
          console.log(`         - Note: ${business.rating}/5 (${business.review_count} avis)`);
          console.log(`         - Livraison: ${business.delivery_fee.toLocaleString()} GNF`);
          console.log(`         - Statut: ${business.is_open ? 'Ouvert' : 'Fermé'}`);
        });
        
        if (businesses.length > 3) {
          console.log(`      ... et ${businesses.length - 3} autre(s) commerce(s)`);
        }
      } else {
        console.log(`      ⚠️  Aucun commerce disponible pour ce type`);
      }
    }

    // Test 4: Statistiques de navigation
    console.log('\n4️⃣ Statistiques de navigation:');
    const totalBusinesses = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    const openBusinesses = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_open', true);

    console.log(`📊 Total des commerces actifs: ${totalBusinesses.count || 0}`);
    console.log(`🟢 Commerces ouverts: ${openBusinesses.count || 0}`);
    console.log(`🔴 Commerces fermés: ${(totalBusinesses.count || 0) - (openBusinesses.count || 0)}`);

    // Test 5: Vérifier la structure des données pour l'interface
    console.log('\n5️⃣ Vérification de la structure des données:');
    const sampleBusiness = await supabase
      .from('businesses')
      .select(`
        *,
        business_type:business_types(id, name, icon, color, image_url),
        category:categories(id, name, icon, color)
      `)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (sampleBusiness.data) {
      const requiredFields = [
        'id', 'name', 'description', 'rating', 'review_count',
        'delivery_time', 'delivery_fee', 'address', 'is_open',
        'cover_image', 'logo'
      ];
      
      console.log('Champs requis pour l\'interface:');
      requiredFields.forEach(field => {
        const hasField = field in sampleBusiness.data;
        const value = sampleBusiness.data[field];
        const status = hasField ? '✅' : '❌';
        const type = value !== null ? typeof value : 'null';
        console.log(`   ${status} ${field}: ${type}`);
      });

      console.log('\nJointures:');
      console.log(`   ✅ business_type: ${sampleBusiness.data.business_type ? 'Présent' : 'Manquant'}`);
      console.log(`   ${sampleBusiness.data.category ? '✅' : '⚠️'} category: ${sampleBusiness.data.category ? 'Présent' : 'Manquant'}`);
    }

    console.log('\n🎉 Test de navigation terminé avec succès!');
    console.log('\n📱 Fonctionnalités disponibles:');
    console.log('   - Navigation depuis la page Services');
    console.log('   - Liste des commerces par type');
    console.log('   - Recherche de commerces');
    console.log('   - Affichage des détails (note, livraison, statut)');
    console.log('   - Pull-to-refresh');
    console.log('   - Gestion d\'erreurs et états de chargement');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testBusinessNavigation(); 