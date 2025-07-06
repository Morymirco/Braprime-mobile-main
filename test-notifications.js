const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = 'VOTRE_SUPABASE_URL';
const supabaseKey = 'VOTRE_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// ID d'un utilisateur de test (remplacez par un vrai ID utilisateur)
const TEST_USER_ID = 'VOTRE_USER_ID_DE_TEST';

// Fonction pour créer des notifications de test
async function createTestNotifications() {
  console.log('🚀 Création de notifications de test...');

  const testNotifications = [
    {
      user_id: TEST_USER_ID,
      type: 'order',
      title: 'Commande confirmée',
      message: 'Votre commande #12345 a été confirmée et est en cours de préparation.',
      priority: 'medium',
      is_read: false,
      data: { order_id: '12345', business_name: 'Restaurant Test' }
    },
    {
      user_id: TEST_USER_ID,
      type: 'delivery',
      title: 'Livraison en cours',
      message: 'Votre commande est en cours de livraison. Le livreur arrive dans 15 minutes.',
      priority: 'high',
      is_read: false,
      data: { order_id: '12345', driver_name: 'Mamadou Diallo' }
    },
    {
      user_id: TEST_USER_ID,
      type: 'reservation',
      title: 'Réservation confirmée',
      message: 'Votre réservation pour le 15 décembre à 19h00 a été confirmée.',
      priority: 'medium',
      is_read: true,
      data: { reservation_id: '67890', business_name: 'Restaurant Test' }
    },
    {
      user_id: TEST_USER_ID,
      type: 'payment',
      title: 'Paiement réussi',
      message: 'Votre paiement de 25,000 GNF a été traité avec succès.',
      priority: 'low',
      is_read: false,
      data: { amount: 25000, method: 'mobile_money' }
    },
    {
      user_id: TEST_USER_ID,
      type: 'promo',
      title: 'Offre spéciale !',
      message: 'Profitez de 20% de réduction sur votre prochaine commande avec le code PROMO20.',
      priority: 'medium',
      is_read: false,
      data: { promo_code: 'PROMO20', discount: 20 }
    }
  ];

  try {
    // Insérer les notifications de test
    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotifications);

    if (error) {
      console.error('❌ Erreur lors de la création des notifications:', error);
      return;
    }

    console.log('✅ Notifications de test créées avec succès !');
    console.log('📱 Vous pouvez maintenant tester l\'icône de notification dans l\'app');

    // Vérifier le nombre de notifications créées
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID);

    console.log(`📊 Total des notifications pour l'utilisateur: ${count}`);

    // Vérifier le nombre de notifications non lues
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', TEST_USER_ID)
      .eq('is_read', false);

    console.log(`🔴 Notifications non lues: ${unreadCount}`);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Fonction pour nettoyer les notifications de test
async function cleanupTestNotifications() {
  console.log('🧹 Nettoyage des notifications de test...');

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', TEST_USER_ID);

    if (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      return;
    }

    console.log('✅ Notifications de test supprimées avec succès !');
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Fonction pour afficher les notifications existantes
async function listNotifications() {
  console.log('📋 Liste des notifications existantes...');

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false });

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
      console.log(`   ${notification.message}`);
      console.log(`   Type: ${notification.type}, Priorité: ${notification.priority}`);
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
    case 'create':
      await createTestNotifications();
      break;
    case 'cleanup':
      await cleanupTestNotifications();
      break;
    case 'list':
      await listNotifications();
      break;
    default:
      console.log('📖 Usage:');
      console.log('  node test-notifications.js create    - Créer des notifications de test');
      console.log('  node test-notifications.js cleanup   - Supprimer les notifications de test');
      console.log('  node test-notifications.js list      - Lister les notifications existantes');
      console.log('');
      console.log('⚠️  N\'oubliez pas de configurer vos clés Supabase et l\'ID utilisateur de test !');
  }
}

main().catch(console.error); 