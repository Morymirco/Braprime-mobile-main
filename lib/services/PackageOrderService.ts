import { supabase } from '../supabase/config';

export interface PackageItem {
  id: string;
  package_type: 'document' | 'parcel' | 'fragile' | 'heavy' | 'express';
  weight: number; // en kg
  dimensions: {
    length: number; // cm
    width: number;  // cm
    height: number; // cm
  };
  
  // Destination spécifique à ce colis
  delivery_address: string;
  delivery_instructions?: string;
  
  // Destinataire spécifique à ce colis
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  
  // Options de service spécifiques
  insurance_required: boolean;
  express_delivery: boolean;
  signature_required: boolean;
}

export interface MultiPackageInfo {
  // Informations communes
  pickup_address: string;
  pickup_instructions?: string;
  
  // Horaires de départ (communs)
  pickup_date: string;
  pickup_time: string;
  drop_date: string;
  drop_time: string;
  
  // Liste des colis avec leurs destinations
  packages: PackageItem[];
  
  // Estimation de prix
  estimated_price: number;
  delivery_time: string;
}

export interface PackageOrderData {
  business_id: number;
  service_name: string;
  service_price: number;
  pickup_address: {
    address: string;
    instructions?: string;
  };
  delivery_preferences: {
    preferred_time: string;
    pickup_date: string;
    pickup_time: string;
    drop_date: string;
    drop_time: string;
    contact_method: string;
  };
  packages: Array<{
    package_type: string;
    weight: string;
    dimensions: string;
    description: string;
    is_fragile: boolean;
    is_urgent: boolean;
    delivery_address: {
      address: string;
      instructions?: string;
    };
    customer_info: {
      name: string;
      phone: string;
      email: string;
    };
  }>;
}

export interface PackageOrderResult {
  success: boolean;
  order_id?: string;
  error?: string;
}

export class PackageOrderService {
  /**
   * Créer une commande multi-colis
   */
  static async createMultiPackageOrder(orderData: PackageOrderData): Promise<PackageOrderResult> {
    try {
      console.log('🚀 [PackageOrderService] Création commande multi-colis:', orderData);

      // Vérifier l'authentification
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      // Créer la commande principale
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          business_id: orderData.business_id,
          status: 'pending',
          total: orderData.service_price,
          delivery_fee: 0,
          grand_total: orderData.service_price,
          delivery_method: 'delivery',
          delivery_address: orderData.pickup_address.address,
          delivery_instructions: `Service de colis: ${orderData.service_name}`,
          payment_method: 'cash',
          payment_status: 'pending',
          available_for_drivers: true
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ [PackageOrderService] Erreur création commande:', orderError);
        return {
          success: false,
          error: 'Erreur lors de la création de la commande'
        };
      }

      // Créer les enregistrements package_orders pour chaque colis (un par un comme dans le client)
      const packageOrderIds = [];
      for (let i = 0; i < orderData.packages.length; i++) {
        const pkg = orderData.packages[i];
        
        const { data: packageOrderData, error: packageOrderError } = await supabase
          .from('package_orders')
          .insert({
            order_id: order.id,
            user_id: user.id,
            business_id: orderData.business_id,
            service_name: `${orderData.service_name} - Colis ${i + 1}`,
            service_price: Math.round(orderData.service_price / orderData.packages.length),
            package_weight: pkg.weight,
            package_dimensions: pkg.dimensions,
            package_description: pkg.description,
            is_fragile: pkg.is_fragile,
            is_urgent: pkg.is_urgent,
            pickup_address: orderData.pickup_address.address,
            pickup_instructions: orderData.pickup_address.instructions,
            delivery_address: pkg.delivery_address.address,
            delivery_instructions: pkg.delivery_address.instructions,
            customer_name: pkg.customer_info.name,
            customer_phone: pkg.customer_info.phone,
            customer_email: pkg.customer_info.email,
            preferred_time: orderData.delivery_preferences.preferred_time,
            pickup_date: orderData.delivery_preferences.pickup_date,
            pickup_time: orderData.delivery_preferences.pickup_time,
            drop_date: orderData.delivery_preferences.drop_date,
            drop_time: orderData.delivery_preferences.drop_time,
            contact_method: orderData.delivery_preferences.contact_method,
            status: 'pending'
          })
          .select()
          .single();

        if (packageOrderError) {
          console.error(`❌ [PackageOrderService] Erreur création colis ${i + 1}:`, packageOrderError);
          // Supprimer la commande créée en cas d'erreur
          await supabase.from('orders').delete().eq('id', order.id);
          return {
            success: false,
            error: `Erreur lors de la création du colis ${i + 1}`
          };
        }

        packageOrderIds.push(packageOrderData.id);
      }

      console.log('🔍 [PackageOrderService] PackageOrderIds récupérés:', packageOrderIds);
      console.log('🚀 [PackageOrderService] Début création order_items pour', orderData.packages.length, 'colis');

      // Créer les éléments de commande pour chaque colis (un par un comme dans le client)
      for (let i = 0; i < orderData.packages.length; i++) {
        const pkg = orderData.packages[i];
        
        const orderItemData = {
          order_id: order.id,
          menu_item_id: null,
          name: `${orderData.service_name} - Colis ${i + 1}`,
          price: Math.round(orderData.service_price / orderData.packages.length),
          quantity: 1,
          special_instructions: JSON.stringify({
            package_order_id: packageOrderIds[i],
            order_type: 'multi_package',
            package_index: i,
            total_packages: orderData.packages.length,
            delivery_address: pkg.delivery_address.address,
            recipient_name: pkg.customer_info.name
          })
        };

        console.log(`🔍 [PackageOrderService] Création order_item ${i + 1}:`, orderItemData);

        const { data: insertedItem, error: itemError } = await supabase
          .from('order_items')
          .insert(orderItemData)
          .select();

        if (itemError) {
          console.error(`❌ [PackageOrderService] Erreur création order_item ${i + 1}:`, itemError);
          // Supprimer la commande et les package_orders créés en cas d'erreur
          await supabase.from('package_orders').delete().eq('order_id', order.id);
          await supabase.from('orders').delete().eq('id', order.id);
          return {
            success: false,
            error: `Erreur lors de la création de l'élément de commande ${i + 1}`
          };
        }

        console.log(`✅ [PackageOrderService] Order_item ${i + 1} créé:`, insertedItem);
      }

      // Vérifier que les order_items ont été créés
      const { data: verifyItems, error: verifyError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (verifyError) {
        console.error('❌ [PackageOrderService] Erreur vérification order_items:', verifyError);
      } else {
        console.log('🔍 [PackageOrderService] Vérification - Order_items trouvés:', verifyItems?.length || 0);
        console.log('🔍 [PackageOrderService] Détails order_items:', verifyItems);
      }

      // Test final : vérifier que tout a été créé correctement
      const { data: finalCheck, error: finalError } = await supabase
        .from('orders')
        .select(`
          id,
          order_items (
            id,
            name,
            price,
            quantity,
            special_instructions
          )
        `)
        .eq('id', order.id)
        .single();

      if (finalError) {
        console.error('❌ [PackageOrderService] Erreur vérification finale:', finalError);
      } else {
        console.log('🔍 [PackageOrderService] Vérification finale - Commande:', finalCheck);
        console.log('🔍 [PackageOrderService] Vérification finale - Order_items:', finalCheck?.order_items?.length || 0);
      }

      console.log('✅ [PackageOrderService] Commande multi-colis créée:', order.id);
      return {
        success: true,
        order_id: order.id
      };

    } catch (error) {
      console.error('❌ [PackageOrderService] Erreur inattendue:', error);
      return {
        success: false,
        error: 'Erreur inattendue lors de la création de la commande'
      };
    }
  }

  /**
   * Récupérer l'historique des commandes de colis d'un utilisateur
   */
  static async getUserPackageOrders(): Promise<any[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer les commandes principales avec leurs order_items (comme le client)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            name,
            price,
            special_instructions
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ [PackageOrderService] Erreur récupération orders:', ordersError);
        throw ordersError;
      }

      // Récupérer les package_orders correspondants
      const { data: packageOrdersData, error: packageOrdersError } = await supabase
        .from('package_orders')
        .select(`
          *,
          businesses(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (packageOrdersError) {
        console.error('❌ [PackageOrderService] Erreur récupération package_orders:', packageOrdersError);
        throw packageOrdersError;
      }

      // Grouper les package_orders par order_id pour identifier les multi-colis
      const packageOrdersByOrderId = packageOrdersData.reduce((acc, pkgOrder) => {
        if (!acc[pkgOrder.order_id]) {
          acc[pkgOrder.order_id] = [];
        }
        acc[pkgOrder.order_id].push(pkgOrder);
        return acc;
      }, {} as Record<string, any[]>);

      // Filtrer seulement les commandes qui ont des package_orders
      const packageOrders = ordersData.filter(order => packageOrdersByOrderId[order.id]);

      return packageOrders.map(order => {
        const packageOrders = packageOrdersByOrderId[order.id] || [];
        const isMultiPackage = packageOrders.length > 1;
        
        // Pour les multi-colis, utiliser le premier package_order comme référence
        const mainPackageOrder = packageOrders[0];
        
        return {
          id: order.id,
          order_number: order.order_number,
          user_id: mainPackageOrder.user_id,
          business_id: mainPackageOrder.business_id,
          service_name: isMultiPackage 
            ? `${mainPackageOrder.service_name} (${packageOrders.length} colis)`
            : mainPackageOrder.service_name,
          service_price: mainPackageOrder.service_price,
          package_details: {
            weight: mainPackageOrder.package_weight,
            dimensions: mainPackageOrder.package_dimensions,
            description: mainPackageOrder.package_description,
            is_fragile: mainPackageOrder.is_fragile,
            is_urgent: mainPackageOrder.is_urgent
          },
          pickup_address: {
            address: mainPackageOrder.pickup_address,
            instructions: mainPackageOrder.pickup_instructions,
            latitude: mainPackageOrder.pickup_latitude,
            longitude: mainPackageOrder.pickup_longitude
          },
          delivery_address: {
            address: isMultiPackage 
              ? `Multi-destinations (${packageOrders.length} colis)`
              : mainPackageOrder.delivery_address,
            instructions: isMultiPackage 
              ? `Service de colis multi-destinations: ${mainPackageOrder.service_name}`
              : mainPackageOrder.delivery_instructions,
            latitude: mainPackageOrder.delivery_latitude,
            longitude: mainPackageOrder.delivery_longitude
          },
          customer_info: {
            name: mainPackageOrder.customer_name,
            phone: mainPackageOrder.customer_phone,
            email: mainPackageOrder.customer_email
          },
          delivery_preferences: {
            preferred_time: mainPackageOrder.preferred_time,
            pickup_date: mainPackageOrder.pickup_date,
            pickup_time: mainPackageOrder.pickup_time,
            drop_date: mainPackageOrder.drop_date,
            drop_time: mainPackageOrder.drop_time,
            contact_method: mainPackageOrder.contact_method
          },
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
          total_amount: order.total,
          delivery_fee: order.delivery_fee,
          grand_total: order.grand_total,
          // Informations supplémentaires pour les multi-colis
          isMultiPackage,
          packageCount: packageOrders.length,
          allPackages: isMultiPackage ? packageOrders.map(pkg => ({
            id: pkg.id,
            package_type: pkg.package_description?.includes('Document') ? 'document' : 
                         pkg.package_description?.includes('Fragile') ? 'fragile' : 'parcel',
            weight: pkg.package_weight,
            dimensions: pkg.package_dimensions,
            delivery_address: pkg.delivery_address,
            recipient_name: pkg.customer_name,
            recipient_phone: pkg.customer_phone,
            status: pkg.status
          })) : undefined,
          // Inclure les order_items pour compatibilité
          order_items: order.order_items || []
        };
      });
    } catch (error) {
      console.error('❌ [PackageOrderService] Erreur récupération historique:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails d'une commande de colis
   */
  static async getPackageOrderDetails(orderId: string): Promise<any> {
    try {
      const { data: packageOrders, error } = await supabase
        .from('package_orders')
        .select(`
          *,
          orders (
            id,
            status,
            total,
            delivery_fee,
            grand_total,
            created_at,
            updated_at
          ),
          businesses (
            id,
            name,
            image_url,
            business_type:business_types (name, icon, color)
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [PackageOrderService] Erreur récupération détails:', error);
        throw error;
      }

      return packageOrders || [];
    } catch (error) {
      console.error('❌ [PackageOrderService] Erreur récupération détails commande:', error);
      throw error;
    }
  }

  /**
   * Calculer le prix estimé d'une commande multi-colis
   */
  static calculateEstimatedPrice(
    basePrice: number,
    packages: PackageItem[]
  ): number {
    let totalPrice = basePrice;
    
    packages.forEach(pkg => {
      if (pkg.insurance_required) totalPrice += 5000;
      if (pkg.express_delivery) totalPrice += 10000;
      if (pkg.signature_required) totalPrice += 2000;
      
      // Ajuster selon le poids
      if (pkg.weight > 5) totalPrice += 3000;
      if (pkg.weight > 10) totalPrice += 5000;
    });
    
    return totalPrice;
  }

  /**
   * Valider les données d'une commande multi-colis
   */
  static validatePackageOrder(packageInfo: MultiPackageInfo): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation des champs communs
    if (!packageInfo.pickup_address.trim()) {
      errors.push('L\'adresse de départ est requise');
    }

    if (!packageInfo.pickup_date.trim()) {
      errors.push('La date de départ est requise');
    }

    if (!packageInfo.pickup_time.trim()) {
      errors.push('L\'heure de départ est requise');
    }

    if (!packageInfo.drop_date.trim()) {
      errors.push('La date de livraison est requise');
    }

    if (!packageInfo.drop_time.trim()) {
      errors.push('L\'heure de livraison est requise');
    }

    // Validation de chaque colis
    packageInfo.packages.forEach((pkg, index) => {
      if (!pkg.delivery_address.trim()) {
        errors.push(`L'adresse de livraison est requise pour le colis ${index + 1}`);
      }

      if (!pkg.recipient_name.trim()) {
        errors.push(`Le nom du destinataire est requis pour le colis ${index + 1}`);
      }

      if (!pkg.recipient_phone.trim()) {
        errors.push(`Le téléphone du destinataire est requis pour le colis ${index + 1}`);
      }

      if (pkg.weight <= 0) {
        errors.push(`Le poids doit être supérieur à 0 pour le colis ${index + 1}`);
      }

      if (pkg.dimensions.length <= 0 || pkg.dimensions.width <= 0 || pkg.dimensions.height <= 0) {
        errors.push(`Les dimensions doivent être supérieures à 0 pour le colis ${index + 1}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
