const fs = require('fs');
const path = require('path');

// Configuration Supabase
const SUPABASE_URL = 'https://gehvdncxbcfotnabmjmo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaHZkbmN4YmNmb3RuYWJtam1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDk5MDIsImV4cCI6MjA2NjEyNTkwMn0.vKsn8CZws3C2l-TNwmgzOIafbrI35EQNDmFHjHdW4i8';

async function setupDatabase() {
  try {
    console.log('📖 Lecture du fichier schema.sql...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Exécution du schéma de base de données...');
    console.log('⚠️  IMPORTANT: Vous devez exécuter ce script manuellement dans l\'interface Supabase');
    console.log('');
    console.log('📋 Étapes à suivre :');
    console.log('1. Allez sur https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Allez dans "SQL Editor"');
    console.log('4. Copiez le contenu du fichier database/schema.sql');
    console.log('5. Collez-le dans l\'éditeur et cliquez sur "Run"');
    console.log('');
    console.log('📄 Contenu du schéma :');
    console.log('='.repeat(50));
    console.log(schema);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du schéma:', error.message);
  }
}

setupDatabase(); 