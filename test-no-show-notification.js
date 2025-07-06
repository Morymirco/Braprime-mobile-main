const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = 'VOTRE_SUPABASE_URL';
const supabaseKey = 'VOTRE_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// ID d'un utilisateur de test (remplacez par un vrai ID utilisateur)
const TEST_USER_ID = 'VOTRE_USER_ID_DE_TEST';

// Fonction pour créer une réservation de test
async function createTestReservation() {
  console.log('📅 Création d\'une réservation de test...');

  const testReservation = {
    user_id: TEST_USER_ID,
    business_id: 1, // Remplacez par un vrai business_id
    business_name: 'Restaurant Test',
    date: '2024-01-15',
    time: '19:00:00',
    guests: 2,
    status: 'pending',
    special_requests: 'Table près de la fenêtre'
  };

  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert([testReservation])
      .select();

    if (error) {
      console.error('❌ Erreur lors de la création de la réservation:', error);
      return null;
    }

    console.log('✅ Réservation créée avec succès !');
    console.log('📋 ID de la réservation:', data[0].id);
    return data[0].id;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return null;
  }
}

// Fonction pour tester le statut no_show
async function testNoShowStatus(reservationId) {
  console.log('🚫 Test du statut no_show...');

  try {
    // Changer le statut vers no_show
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'no_show' })
      .eq('id', reservationId)
      .select();

    if (error) {
      console.error('❌ Erreur lors du changement de statut:', error);
      return;
    }

    console.log('✅ Statut changé vers no_show avec succès !');

    // Vérifier que la notification a été créée
    await checkNotificationCreated('no_show', reservationId);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Fonction pour vérifier qu'une notification a été créée
async function checkNotificationCreated(expectedStatus, reservationId) {
  console.log('🔍 Vérification de la notification créée...');

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('type', 'reservation')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      return;
    }

    if (data.length === 0) {
      console.log('⚠️  Aucune notification trouvée');
      return;
    }

    const notification = data[0];
    console.log('✅ Notification trouvée !');
    console.log('📧 Titre:', notification.title);
    console.log('📝 Message:', notification.message);
    console.log('🏷️  Priorité:', notification.priority);
    console.log('📊 Données:', notification.data);
    console.log('⏰ Créée:', new Date(notification.created_at).toLocaleString());

    // Vérifier que la notification correspond au statut attendu
    if (notification.data && notification.data.status === expectedStatus) {
      console.log('✅ Notification correcte pour le statut', expectedStatus);
    } else {
      console.log('⚠️  Notification ne correspond pas au statut attendu');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Fonction pour tester tous les statuts de réservation
async function testAllReservationStatuses() {
  console.log('🧪 Test de tous les statuts de réservation...');

  const statuses = ['confirmed', 'cancelled', 'completed', 'no_show'];
  
  for (const status of statuses) {
    console.log(`\n📋 Test du statut: ${status}`);
    
    // Créer une nouvelle réservation pour chaque test
    const reservationId = await createTestReservation();
    if (!reservationId) continue;

    // Attendre un peu pour éviter les conflits
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Changer le statut
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: status })
        .eq('id', reservationId);

      if (error) {
        console.error(`❌ Erreur pour le statut ${status}:`, error);
        continue;
      }

      console.log(`✅ Statut ${status} appliqué avec succès`);
      
      // Vérifier la notification
      await checkNotificationCreated(status, reservationId);

    } catch (error) {
      console.error(`❌ Erreur inattendue pour ${status}:`, error);
    }

    // Attendre avant le prochain test
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('🧹 Nettoyage des données de test...');

  try {
    // Supprimer les réservations de test
    const { error: reservationError } = await supabase
      .from('reservations')
      .delete()
      .eq('user_id', TEST_USER_ID)
      .eq('business_name', 'Restaurant Test');

    if (reservationError) {
      console.error('❌ Erreur lors du nettoyage des réservations:', reservationError);
    } else {
      console.log('✅ Réservations de test supprimées');
    }

    // Supprimer les notifications de test
    const { error: notificationError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', TEST_USER_ID)
      .eq('type', 'reservation');

    if (notificationError) {
      console.error('❌ Erreur lors du nettoyage des notifications:', notificationError);
    } else {
      console.log('✅ Notifications de test supprimées');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue lors du nettoyage:', error);
  }
}

// Fonction pour lister les notifications récentes
async function listRecentNotifications() {
  console.log('📋 Liste des notifications récentes...');

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return;
    }

    if (data.length === 0) {
      console.log('📭 Aucune notification trouvée');
      return;
    }

    console.log(`📊 ${data.length} notification(s) trouvée(s):`);
    data.forEach((notification, index) => {
      console.log(`${index + 1}. [${notification.is_read ? '✅' : '🔴'}] ${notification.title}`);
      console.log(`   Type: ${notification.type}, Priorité: ${notification.priority}`);
      console.log(`   Statut: ${notification.data?.status || 'N/A'}`);
      console.log(`   Créée: ${new Date(notification.created_at).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécution du script
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'test-no-show':
      const reservationId = await createTestReservation();
      if (reservationId) {
        await testNoShowStatus(reservationId);
      }
      break;
      
    case 'test-all-statuses':
      await testAllReservationStatuses();
      break;
      
    case 'cleanup':
      await cleanupTestData();
      break;
      
    case 'list':
      await listRecentNotifications();
      break;
      
    default:
      console.log('📖 Usage:');
      console.log('  node test-no-show-notification.js test-no-show     - Tester le statut no_show');
      console.log('  node test-no-show-notification.js test-all-statuses - Tester tous les statuts');
      console.log('  node test-no-show-notification.js cleanup          - Nettoyer les données de test');
      console.log('  node test-no-show-notification.js list             - Lister les notifications récentes');
      console.log('');
      console.log('⚠️  N\'oubliez pas de configurer vos clés Supabase et l\'ID utilisateur de test !');
  }
}

main().catch(console.error); 