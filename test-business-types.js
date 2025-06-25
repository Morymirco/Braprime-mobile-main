const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBusinessTypes() {
  console.log('🧪 Test de récupération des types de commerce...\n');

  try {
    // Test 1: Récupérer tous les types de commerce
    console.log('1️⃣ Récupération de tous les types de commerce:');
    const { data: businessTypes, error: businessTypesError } = await supabase
      .from('business_types')
      .select('*')
      .order('name');

    if (businessTypesError) {
      console.error('❌ Erreur lors de la récupération des types de commerce:', businessTypesError);
      return;
    }

    console.log(`✅ ${businessTypes.length} types de commerce récupérés:`);
    businessTypes.forEach(type => {
      console.log(`   - ${type.name} (ID: ${type.id})`);
      console.log(`     Image: ${type.image_url || 'Aucune image'}`);
      console.log(`     Couleur: ${type.color}`);
      console.log(`     Description: ${type.description || 'Aucune description'}`);
      console.log('');
    });

    // Test 2: Vérifier qu'il y a des images
    const typesWithImages = businessTypes.filter(type => type.image_url);
    const typesWithoutImages = businessTypes.filter(type => !type.image_url);
    
    console.log('2️⃣ Vérification des images:');
    console.log(`✅ Types avec images: ${typesWithImages.length}`);
    console.log(`⚠️  Types sans images: ${typesWithoutImages.length}`);
    
    if (typesWithoutImages.length > 0) {
      console.log('Types sans images:');
      typesWithoutImages.forEach(type => {
        console.log(`   - ${type.name}`);
      });
    }

    // Test 3: Vérifier la structure des données
    console.log('\n3️⃣ Vérification de la structure des données:');
    const requiredFields = ['id', 'name', 'icon', 'color', 'image_url', 'description', 'features'];
    const sampleType = businessTypes[0];
    
    if (sampleType) {
      console.log('Structure d\'un type de commerce:');
      requiredFields.forEach(field => {
        const hasField = field in sampleType;
        const value = sampleType[field];
        console.log(`   ${hasField ? '✅' : '❌'} ${field}: ${value !== null ? typeof value : 'null'}`);
      });
    }

    // Test 4: Compter les types par catégorie
    console.log('\n4️⃣ Statistiques par type:');
    const typeCounts = {};
    businessTypes.forEach(type => {
      typeCounts[type.name] = (typeCounts[type.name] || 0) + 1;
    });
    
    Object.entries(typeCounts).forEach(([name, count]) => {
      console.log(`   - ${name}: ${count}`);
    });

    console.log('\n🎉 Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testBusinessTypes(); 