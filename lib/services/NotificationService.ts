
export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
}

export interface SendNotificationRequest {
  user_ids?: string[];
  user_types?: ('customer' | 'partner' | 'driver' | 'admin')[];
  device_types?: ('ios' | 'android' | 'web' | 'unknown')[];
  notification: NotificationData;
  send_to_all?: boolean;
}

export interface SendNotificationResponse {
  success: boolean;
  message?: string;
  sent_count?: number;
  error_count?: number;
  total_tokens?: number;
  results?: any;
  error?: string;
}

export class NotificationService {
  private static readonly EDGE_FUNCTION_URL = 'https://jeumizxzlwjvgerrcpjr.supabase.co/functions/v1/send-notifications';
  private static readonly AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

  /**
   * Envoyer une notification à des utilisateurs spécifiques
   */
  static async sendToUsers(
    userIds: string[],
    notification: NotificationData
  ): Promise<SendNotificationResponse> {
    const request: SendNotificationRequest = {
      user_ids: userIds,
      notification
    };

    return this.sendNotification(request);
  }

  /**
   * Envoyer une notification à des types d'utilisateurs spécifiques
   */
  static async sendToUserTypes(
    userTypes: ('customer' | 'partner' | 'driver' | 'admin')[],
    notification: NotificationData
  ): Promise<SendNotificationResponse> {
    const request: SendNotificationRequest = {
      user_types: userTypes,
      notification
    };

    return this.sendNotification(request);
  }

  /**
   * Envoyer une notification à des types de devices spécifiques
   */
  static async sendToDeviceTypes(
    deviceTypes: ('ios' | 'android' | 'web' | 'unknown')[],
    notification: NotificationData
  ): Promise<SendNotificationResponse> {
    const request: SendNotificationRequest = {
      device_types: deviceTypes,
      notification
    };

    return this.sendNotification(request);
  }

  /**
   * Envoyer une notification à tous les utilisateurs
   */
  static async sendToAll(notification: NotificationData): Promise<SendNotificationResponse> {
    const request: SendNotificationRequest = {
      send_to_all: true,
      notification
    };

    return this.sendNotification(request);
  }

  /**
   * Envoyer une notification de commande
   */
  static async sendOrderNotification(
    userId: string,
    orderId: string,
    status: string,
    businessName?: string
  ): Promise<SendNotificationResponse> {
    const title = 'Mise à jour de commande';
    const body = businessName 
      ? `Votre commande chez ${businessName} est maintenant ${status}`
      : `Votre commande est maintenant ${status}`;

    return this.sendToUsers([userId], {
      title,
      body,
      data: {
        type: 'order_update',
        order_id: orderId,
        status,
        business_name: businessName
      },
      priority: 'high'
    });
  }

  /**
   * Envoyer une notification de paiement
   */
  static async sendPaymentNotification(
    userId: string,
    amount: number,
    status: 'success' | 'failed' | 'pending'
  ): Promise<SendNotificationResponse> {
    const statusText = {
      success: 'réussi',
      failed: 'échoué',
      pending: 'en attente'
    }[status];

    const title = 'Notification de paiement';
    const body = `Votre paiement de ${amount} GNF a ${statusText}`;

    return this.sendToUsers([userId], {
      title,
      body,
      data: {
        type: 'payment',
        amount,
        status
      },
      priority: 'high'
    });
  }

  /**
   * Envoyer une notification de livraison
   */
  static async sendDeliveryNotification(
    userId: string,
    orderId: string,
    driverName?: string,
    estimatedTime?: string
  ): Promise<SendNotificationResponse> {
    const title = 'Livraison en cours';
    const body = driverName 
      ? `${driverName} livre votre commande${estimatedTime ? ` (${estimatedTime})` : ''}`
      : `Votre commande est en cours de livraison${estimatedTime ? ` (${estimatedTime})` : ''}`;

    return this.sendToUsers([userId], {
      title,
      body,
      data: {
        type: 'delivery',
        order_id: orderId,
        driver_name: driverName,
        estimated_time: estimatedTime
      },
      priority: 'high'
    });
  }

  /**
   * Envoyer une notification promotionnelle
   */
  static async sendPromotionalNotification(
    userTypes: ('customer' | 'partner' | 'driver' | 'admin')[],
    title: string,
    body: string,
    promotionData?: any
  ): Promise<SendNotificationResponse> {
    return this.sendToUserTypes(userTypes, {
      title,
      body,
      data: {
        type: 'promotion',
        ...promotionData
      },
      priority: 'normal'
    });
  }

  /**
   * Envoyer une notification système
   */
  static async sendSystemNotification(
    title: string,
    body: string,
    systemData?: any
  ): Promise<SendNotificationResponse> {
    return this.sendToAll({
      title,
      body,
      data: {
        type: 'system',
        ...systemData
      },
      priority: 'high'
    });
  }

  /**
   * Méthode principale pour envoyer des notifications
   */
  private static async sendNotification(
    request: SendNotificationRequest
  ): Promise<SendNotificationResponse> {
    try {
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AUTH_TOKEN}`,
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erreur lors de l\'envoi de notification:', result);
        return {
          success: false,
          error: result.error || 'Erreur inconnue'
        };
      }

      console.log('Notification envoyée avec succès:', result);
      return result;

    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      };
    }
  }

  /**
   * Créer une notification de test
   */
  static async sendTestNotification(
    userId: string,
    message: string = 'Ceci est un test de notification'
  ): Promise<SendNotificationResponse> {
    return this.sendToUsers([userId], {
      title: 'Test de notification',
      body: message,
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      },
      priority: 'normal'
    });
  }

  /**
   * Envoyer une notification de bienvenue
   */
  static async sendWelcomeNotification(
    userId: string,
    userName: string
  ): Promise<SendNotificationResponse> {
    return this.sendToUsers([userId], {
      title: 'Bienvenue sur BraPrime !',
      body: `Bonjour ${userName}, bienvenue sur notre plateforme de livraison.`,
      data: {
        type: 'welcome',
        user_name: userName
      },
      priority: 'normal'
    });
  }

  /**
   * Envoyer une notification de rappel de commande
   */
  static async sendOrderReminderNotification(
    userId: string,
    orderId: string,
    businessName: string
  ): Promise<SendNotificationResponse> {
    return this.sendToUsers([userId], {
      title: 'Rappel de commande',
      body: `N\'oubliez pas de récupérer votre commande chez ${businessName}`,
      data: {
        type: 'order_reminder',
        order_id: orderId,
        business_name: businessName
      },
      priority: 'normal'
    });
  }
}

export default NotificationService;