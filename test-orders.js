const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOrders() {
  console.log('🔍 Test du service de commandes...\n');

  try {
    // 1. Vérifier la structure de la table orders
    console.log('📋 1. Structure de la table orders:');
    const { data: tableInfo, error: tableError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError);
      return;
    }

    console.log('✅ Table orders accessible');
    if (tableInfo.length > 0) {
      console.log('📊 Colonnes disponibles:', Object.keys(tableInfo[0]));
    }
    console.log('');

    // 2. Lister toutes les commandes existantes
    console.log('📦 2. Commandes existantes:');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Erreur lors de la récupération des commandes:', ordersError);
      return;
    }

    if (orders.length === 0) {
      console.log('⚠️  Aucune commande trouvée');
      console.log('💡 Créez des commandes via l\'application');
    } else {
      console.log(`✅ ${orders.length} commande(s) trouvée(s):`);
      orders.forEach((order, index) => {
        console.log(`\n📦 Commande ${index + 1}:`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Utilisateur: ${order.user_id}`);
        console.log(`   Commerce: ${order.business_name} (ID: ${order.business_id})`);
        console.log(`   Statut: ${order.status}`);
        console.log(`   Total: ${order.grand_total} CFA`);
        console.log(`   Méthode de paiement: ${order.payment_method}`);
        console.log(`   Statut paiement: ${order.payment_status}`);
        console.log(`   Créée le: ${new Date(order.created_at).toLocaleString('fr-FR')}`);
        
        if (order.items && order.items.length > 0) {
          console.log(`   Articles: ${order.items.length} article(s)`);
          order.items.forEach((item, i) => {
            console.log(`     - ${item.name || 'Article'} x${item.quantity} (${item.price} CFA)`);
          });
        }
      });
    }

    console.log('');

    // 3. Vérifier les statuts de commande
    console.log('🎭 3. Statuts de commande disponibles:');
    const { data: statuses, error: statusError } = await supabase
      .from('order_statuses')
      .select('*')
      .order('sort_order');

    if (statusError) {
      console.error('❌ Erreur lors de la récupération des statuts:', statusError);
    } else {
      console.log('✅ Statuts disponibles:');
      statuses.forEach(status => {
        console.log(`   ${status.name}: ${status.label} (${status.color})`);
      });
    }

    console.log('');

    // 4. Vérifier les méthodes de paiement
    console.log('💳 4. Méthodes de paiement disponibles:');
    const { data: paymentMethods, error: paymentError } = await supabase
      .from('payment_methods')
      .select('*')
      .order('id');

    if (paymentError) {
      console.error('❌ Erreur lors de la récupération des méthodes de paiement:', paymentError);
    } else {
      console.log('✅ Méthodes de paiement disponibles:');
      paymentMethods.forEach(method => {
        console.log(`   ${method.name}: ${method.description} (${method.is_available ? 'Disponible' : 'Indisponible'})`);
      });
    }

    console.log('');

    // 5. Statistiques des commandes (si des commandes existent)
    if (orders.length > 0) {
      console.log('📊 5. Statistiques des commandes:');
      
      const stats = {
        total: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.grand_total, 0),
        pending: orders.filter(order => order.status === 'pending').length,
        confirmed: orders.filter(order => order.status === 'confirmed').length,
        preparing: orders.filter(order => order.status === 'preparing').length,
        delivering: orders.filter(order => order.status === 'picked_up').length,
        delivered: orders.filter(order => order.status === 'delivered').length,
        cancelled: orders.filter(order => order.status === 'cancelled').length,
        averageRating: orders.filter(order => order.customer_rating)
          .reduce((sum, order) => sum + order.customer_rating, 0) / 
          (orders.filter(order => order.customer_rating).length || 1)
      };

      console.log(`   Total de commandes: ${stats.total}`);
      console.log(`   Montant total dépensé: ${stats.totalSpent} CFA`);
      console.log(`   En attente: ${stats.pending}`);
      console.log(`   Confirmées: ${stats.confirmed}`);
      console.log(`   En préparation: ${stats.preparing}`);
      console.log(`   En livraison: ${stats.delivering}`);
      console.log(`   Livrées: ${stats.delivered}`);
      console.log(`   Annulées: ${stats.cancelled}`);
      console.log(`   Note moyenne: ${stats.averageRating.toFixed(1)}/5`);
    }

    console.log('\n🎉 Test des commandes terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testOrders(); 