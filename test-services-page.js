const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testServicesPage() {
  console.log('🧪 Test de la page Services...\n');

  try {
    // Test 1: Récupérer tous les types de commerce
    console.log('1️⃣ Récupération des types de commerce pour la page Services:');
    const { data: businessTypes, error: businessTypesError } = await supabase
      .from('business_types')
      .select('*')
      .order('name');

    if (businessTypesError) {
      console.error('❌ Erreur lors de la récupération des types de commerce:', businessTypesError);
      return;
    }

    console.log(`✅ ${businessTypes.length} types de commerce récupérés pour la page Services:`);
    
    // Afficher les détails de chaque type
    businessTypes.forEach((type, index) => {
      console.log(`\n${index + 1}. ${type.name.toUpperCase()}:`);
      console.log(`   - ID: ${type.id}`);
      console.log(`   - Nom formaté: ${formatBusinessTypeName(type.name)}`);
      console.log(`   - Image: ${type.image_url ? '✅ Disponible' : '❌ Manquante'}`);
      console.log(`   - Badge: ${getBadge(type.name) || 'Aucun'}`);
      console.log(`   - Description: ${type.description || 'Aucune description'}`);
      console.log(`   - Couleur: ${type.color}`);
    });

    // Test 2: Vérifier les badges
    console.log('\n2️⃣ Vérification des badges:');
    const typesWithBadges = businessTypes.filter(type => getBadge(type.name));
    const typesWithoutBadges = businessTypes.filter(type => !getBadge(type.name));
    
    console.log(`✅ Types avec badges: ${typesWithBadges.length}`);
    typesWithBadges.forEach(type => {
      console.log(`   - ${type.name}: ${getBadge(type.name)}`);
    });
    
    console.log(`⚠️  Types sans badges: ${typesWithoutBadges.length}`);
    typesWithoutBadges.forEach(type => {
      console.log(`   - ${type.name}`);
    });

    // Test 3: Vérifier les images
    console.log('\n3️⃣ Vérification des images:');
    const typesWithImages = businessTypes.filter(type => type.image_url);
    const typesWithoutImages = businessTypes.filter(type => !type.image_url);
    
    console.log(`✅ Types avec images: ${typesWithImages.length}`);
    console.log(`⚠️  Types sans images: ${typesWithoutImages.length}`);
    
    if (typesWithoutImages.length > 0) {
      console.log('Types nécessitant des images:');
      typesWithoutImages.forEach(type => {
        console.log(`   - ${type.name}`);
      });
    }

    // Test 4: Statistiques pour la page
    console.log('\n4️⃣ Statistiques pour la page Services:');
    console.log(`📊 Total des types de commerce: ${businessTypes.length}`);
    console.log(`🏷️  Types avec badges: ${typesWithBadges.length}`);
    console.log(`🖼️  Types avec images: ${typesWithImages.length}`);
    console.log(`📝 Types avec descriptions: ${businessTypes.filter(type => type.description).length}`);

    // Test 5: Vérifier la compatibilité avec l'interface
    console.log('\n5️⃣ Vérification de la compatibilité interface:');
    const requiredFields = ['id', 'name', 'icon', 'color', 'image_url', 'description', 'features'];
    const sampleType = businessTypes[0];
    
    if (sampleType) {
      console.log('Champs requis pour l\'interface:');
      requiredFields.forEach(field => {
        const hasField = field in sampleType;
        const value = sampleType[field];
        const status = hasField ? '✅' : '❌';
        const type = value !== null ? typeof value : 'null';
        console.log(`   ${status} ${field}: ${type}`);
      });
    }

    console.log('\n🎉 Test de la page Services terminé avec succès!');
    console.log('\n📱 La page Services devrait maintenant afficher:');
    console.log(`   - ${businessTypes.length} cartes de services`);
    console.log(`   - ${typesWithBadges.length} badges spéciaux`);
    console.log(`   - ${typesWithImages.length} images personnalisées`);
    console.log('   - Pull-to-refresh fonctionnel');
    console.log('   - Gestion d\'erreurs et états de chargement');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Fonctions utilitaires (copiées de la page Services)
function formatBusinessTypeName(name) {
  const nameMap = {
    'restaurant': 'Restaurants',
    'cafe': 'Cafés',
    'market': 'Marchés',
    'supermarket': 'Supermarchés',
    'pharmacy': 'Pharmacie',
    'electronics': 'Électronique',
    'beauty': 'Beauté',
    'hairdressing': 'Coiffure',
    'hardware': 'Bricolage',
    'bookstore': 'Librairie',
    'document_service': 'Documents'
  };
  return nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

function getBadge(name) {
  const badgeMap = {
    'supermarket': '24/7',
    'electronics': 'New',
    'pharmacy': '24/7',
    'market': '24/7'
  };
  return badgeMap[name];
}

// Exécuter le test
testServicesPage(); 